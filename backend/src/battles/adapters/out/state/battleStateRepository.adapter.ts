import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { Prisma } from 'generated/prisma/client'
import { type Battle as PrismaBattle } from 'generated/prisma/client'
import { PrismaService } from '../../../../prisma/prisma.service'
import { RedisRepository } from '../../../../redis/redis.repository'
import {
  ActiveBattleState,
  BattleTeam,
  BattleDiscussion,
  BattleDefense,
  BattleChat,
  BattlePhaseName,
  BattleDiscussionStatus,
  BattleDiscussionType,
} from '../../../domains/models/types/battle.types'
import { BATTLE_PHASE, BATTLE_PLAYTIME, BATTLE_TEAM } from '../../../domains/models/const/battles.const'
import type { Mvp } from '../../../domains/models/types/battleResult.types'
import { BattleStatePort } from '../../../application/ports/out/battleState.port'

interface ParticipantEntry {
  userId: string
  team: BattleTeam
}

interface TeamVoteEntry {
  userId: string
  team: BattleTeam
}

interface UserInfoEntry {
  userId: string
  nickname: string
}

interface BattleChatSnapshot extends Omit<BattleChat, 'createdAt'> {
  createdAt: string
}

interface SerializedCore {
  battleId: string
  status?: string
  round: number
  topics: string[]
  totalRounds: number
  phase: BattlePhaseName
  phaseCount: number
  startedAt: number | null
  expiredAt: number | null
  skipState: string[]
  participants: [string, BattleTeam][]
  teamVotes: [string, BattleTeam][]
  userInfoMap: [string, string][]
  teamAUsers: string[]
  teamBUsers: string[]
  allRoomId: string
  teamARoomId: string
  teamBRoomId: string
}

interface SerializedAttacks {
  all: (BattleDiscussion | null)[]
  opinionHistory: BattleDiscussion[]
}

interface SerializedDefenses {
  all: (BattleDefense | null)[]
}

type SerializedChats = BattleChatSnapshot[]

@Injectable()
export class BattleStateRepositoryAdapter implements BattleStatePort {
  private readonly logger = new Logger(BattleStateRepositoryAdapter.name)

  private readonly liveStates = new Map<string, ActiveBattleState>()

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisRepository,
  ) {}

  // ─── Redis 키 헬퍼 ──────────────────────────────────────────────────────────

  private getCoreKey(battleId: string): string {
    return `battle:core:${battleId}`
  }

  private getAttacksKey(battleId: string): string {
    return `battle:attacks:${battleId}`
  }

  private getDefensesKey(battleId: string): string {
    return `battle:defenses:${battleId}`
  }

  private getChatsAllKey(battleId: string): string {
    return `battle:chats:all:${battleId}`
  }

  private getChatsAKey(battleId: string): string {
    return `battle:chats:a:${battleId}`
  }

  private getChatsBKey(battleId: string): string {
    return `battle:chats:b:${battleId}`
  }

  /** discussion HASH */
  private getDiscussionHashKey(battleId: string, discussionId: string): string {
    return `battle:${battleId}:disc:${discussionId}`
  }

  /** phase별 discussion ID SET 키 */
  private getDiscussionSetKey(battleId: string, type: 'attack' | 'defense', team: BattleTeam): string {
    return `battle:${battleId}:discs:${type}:${team}`
  }

  /** 배틀 전체 discussion ID SET */
  private getAllDiscussionIdsKey(battleId: string): string {
    return `battle:${battleId}:disc_ids`
  }

  /** 투표자 SET 키  */
  private getVoteVotersKey(battleId: string, discussionId: string): string {
    return `battle:${battleId}:vote:${discussionId}:voters`
  }

  /** 유저별 현재 투표 discussion 키 */
  private getUserVoteKey(battleId: string, userId: string): string {
    return `battle:${battleId}:voter:${userId}`
  }

  async loadBattleState(battleId: string): Promise<{ battle: PrismaBattle; state: ActiveBattleState }> {
    const live = this.liveStates.get(battleId)
    if (live) {
      return { battle: { id: battleId, status: live.status } as PrismaBattle, state: live }
    }

    const cached = await this.loadStateFromCache(battleId)
    if (cached) {
      this.liveStates.set(battleId, cached)
      return { battle: { id: battleId, status: cached.status } as PrismaBattle, state: cached }
    }

    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })
    if (!battle) throw new NotFoundException('배틀이 존재하지 않습니다.')

    const state = this.buildStateFromBattle(battle)
    this.liveStates.set(battleId, state)
    this.flushAllToRedis(state)
    return { battle, state }
  }

  saveBattleState(battleId: string, state: ActiveBattleState): void {
    this.liveStates.set(battleId, state)
    this.flushAllToRedis(state)
    this.flushToDB(battleId, state)
  }

  async updateSkipState(battleId: string, skipList: Set<string>): Promise<void> {
    const live = this.liveStates.get(battleId)
    if (live) {
      live.skipState = new Set(skipList)
      const coreJson = JSON.stringify(this.serializeCore(live))
      void this.redis
        .set(this.getCoreKey(battleId), coreJson)
        .catch(err => this.logger.error(`[updateSkipState] Redis write failed for ${battleId}: ${(err as Error).message}`))
    } else {
      await this.patchSkipCache(battleId, skipList)
    }

    this.prisma.battle
      .update({ where: { id: battleId }, data: { skipState: Array.from(skipList), updatedAt: new Date() } })
      .catch(err => this.logger.error(`[updateSkipState] DB write failed for ${battleId}: ${(err as Error).message}`))
  }

  /** 배틀 종료 시 메모리, 캐시 삭제 */
  async clearCache(battleId: string): Promise<void> {
    const allDiscIds = await this.redis.smembers(this.getAllDiscussionIdsKey(battleId))
    const discKeysToDelete = allDiscIds.flatMap(id => [this.getDiscussionHashKey(battleId, id), this.getVoteVotersKey(battleId, id)])

    const userVoteKeys = await this.getUserVoteKeys(battleId)

    this.liveStates.delete(battleId)

    const stateKeys = [
      this.getCoreKey(battleId),
      this.getAttacksKey(battleId),
      this.getDefensesKey(battleId),
      this.getChatsAllKey(battleId),
      this.getChatsAKey(battleId),
      this.getChatsBKey(battleId),
      this.getAllDiscussionIdsKey(battleId),
    ]

    await this.redis.mdel([...stateKeys, ...discKeysToDelete, ...userVoteKeys])
  }

  private async getUserVoteKeys(battleId: string): Promise<string[]> {
    const live = this.liveStates.get(battleId)
    if (live && live.participants.size > 0) {
      return [...live.participants.keys()].map(uid => this.getUserVoteKey(battleId, uid))
    }

    const coreRaw = await this.redis.get(this.getCoreKey(battleId))
    if (!coreRaw) return []

    const core = JSON.parse(coreRaw) as SerializedCore
    const pairs = Array.isArray(core.participants) ? core.participants : []
    const userIds = pairs.map(([userId]) => userId).filter((id): id is string => typeof id === 'string')
    return [...new Set(userIds)].map(uid => this.getUserVoteKey(battleId, uid))
  }

  async saveDiscussionToRedis(battleId: string, discussion: BattleDiscussion, discussionType: 'attack' | 'defense', team: BattleTeam): Promise<void> {
    const hashData: Record<string, string> = {
      discussionId: discussion.discussionId,
      authorId: discussion.author.authorId,
      nickname: discussion.author.nickname,
      type: discussion.type,
      content: discussion.content,
      status: discussion.status,
      team: discussion.team,
    }
    if (discussion.selectedAt !== undefined) {
      hashData.selectedAt = String(discussion.selectedAt)
    }

    await Promise.all([
      this.redis.hmset(this.getDiscussionHashKey(battleId, discussion.discussionId), hashData),
      this.redis.sadd(this.getDiscussionSetKey(battleId, discussionType, team), discussion.discussionId),
      this.redis.sadd(this.getAllDiscussionIdsKey(battleId), discussion.discussionId),
    ])
  }

  async resetPhaseDiscussionsInRedis(battleId: string, discussionType: 'attack' | 'defense', teams: BattleTeam[]): Promise<void> {
    const setKeys = teams.map(team => this.getDiscussionSetKey(battleId, discussionType, team))
    const allIds = await Promise.all(setKeys.map(key => this.redis.smembers(key)))

    const keysToDelete = [...setKeys, ...allIds.flat().flatMap(id => [this.getDiscussionHashKey(battleId, id), this.getVoteVotersKey(battleId, id)])]

    if (keysToDelete.length > 0) {
      await this.redis.mdel(keysToDelete)
    }
  }

  //redis atomic vote 처리
  private readonly CAST_VOTE_LUA = `
local added = redis.call('SADD', KEYS[1], ARGV[1])
if added == 0 then
  return {0}
end
local prev = redis.call('GETSET', KEYS[2], ARGV[2])
if prev and prev ~= '' and prev ~= ARGV[2] then
  redis.call('SREM', ARGV[3] .. prev .. ':voters', ARGV[1])
end
return {1, prev}
`
  async castVoteInRedis(battleId: string, discussionId: string, userId: string): Promise<{ added: boolean; prevDiscussionId: string | null }> {
    const votersKey = this.getVoteVotersKey(battleId, discussionId)
    const userVoteKey = this.getUserVoteKey(battleId, userId)
    const voteKeyPrefix = `battle:${battleId}:vote:`

    const result = (await this.redis.eval(this.CAST_VOTE_LUA, [votersKey, userVoteKey], [userId, discussionId, voteKeyPrefix])) as [number, string?]

    const [added, prev] = result
    if (added === 0) {
      return { added: false, prevDiscussionId: null }
    }

    const prevDiscussionId = prev && prev !== discussionId ? prev : null
    return { added: true, prevDiscussionId }
  }

  parseMvpsState(value: unknown): Mvp[] {
    if (!Array.isArray(value)) return []
    return value
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const mvp = item as Partial<Mvp>
        const team: 'A' | 'B' | 'NONE' = mvp.team === 'A' ? 'A' : mvp.team === 'B' ? 'B' : 'NONE'
        return {
          userId: typeof mvp.userId === 'string' ? mvp.userId : '',
          nickname: typeof mvp.nickname === 'string' ? mvp.nickname : '',
          team,
          score: typeof mvp.score === 'number' ? mvp.score : 0,
          totalVotes: typeof mvp.totalVotes === 'number' ? mvp.totalVotes : 0,
          opinionCount: typeof mvp.opinionCount === 'number' ? mvp.opinionCount : 0,
          selectedOpinionCount: typeof mvp.selectedOpinionCount === 'number' ? mvp.selectedOpinionCount : 0,
          joinedAt: typeof mvp.joinedAt === 'number' ? mvp.joinedAt : 0,
        } as Mvp
      })
      .filter(mvp => mvp.nickname)
  }

  getNicknameByUserId(state: ActiveBattleState, userId: string): string | null {
    return state.userInfoMap.get(userId) ?? null
  }

  async isNicknameDuplicate(battleId: string, nickname: string): Promise<boolean> {
    const { state } = await this.loadBattleState(battleId)
    return Array.from(state.userInfoMap.values()).includes(nickname)
  }

  // ─── 비동기 flush 헬퍼 ──────────────────────────────────────────────────────
  private flushAllToRedis(state: ActiveBattleState): void {
    const battleId = state.battleId
    const entries: [string, string][] = [
      [this.getCoreKey(battleId), JSON.stringify(this.serializeCore(state))],
      [this.getAttacksKey(battleId), JSON.stringify(this.serializeAttacks(state))],
      [this.getDefensesKey(battleId), JSON.stringify(this.serializeDefenses(state))],
      [this.getChatsAllKey(battleId), JSON.stringify(this.serializeChatState(state.all.chats))],
      [this.getChatsAKey(battleId), JSON.stringify(this.serializeChatState(state.teamA.chats))],
      [this.getChatsBKey(battleId), JSON.stringify(this.serializeChatState(state.teamB.chats))],
    ]
    void this.redis.mset(entries).catch(err => this.logger.error(`[flushAllToRedis] failed for ${battleId}: ${(err as Error).message}`))
  }

  private flushToDB(battleId: string, state: ActiveBattleState): void {
    this.prisma.battle
      .update({ where: { id: battleId }, data: this.buildUpdateData(state) })
      .catch(err => this.logger.error(`[flushToDB] failed for ${battleId}: ${(err as Error).message}`))
  }

  private buildUpdateData(state: ActiveBattleState): Prisma.BattleUpdateInput {
    return {
      currentRound: state.round,
      currentPhase: state.phase,
      phaseCount: state.phaseCount,
      startedAt: state.startedAt ? new Date(state.startedAt) : null,
      expiredAt: state.expiredAt ? new Date(state.expiredAt) : null,
      participantsState: this.serializeParticipantsState(state.participants) as unknown as Prisma.InputJsonValue,
      teamVotesState: this.serializeTeamVotesState(state.teamVotes) as unknown as Prisma.InputJsonValue,
      userInfoState: this.serializeUserInfoState(state.userInfoMap) as unknown as Prisma.InputJsonValue,
      attacksState: {
        teamA: state.teamA.attacks,
        teamB: state.teamB.attacks,
        all: state.all.attacks,
      } as unknown as Prisma.InputJsonValue,
      defensesState: {
        teamA: state.teamA.defenses,
        teamB: state.teamB.defenses,
        all: state.all.defenses,
      } as unknown as Prisma.InputJsonValue,
      opinionHistoryState: state.opinionHistory as unknown as Prisma.InputJsonValue,
      chatsAllState: this.serializeChatState(state.all.chats) as unknown as Prisma.InputJsonValue,
      chatsTeamAState: this.serializeChatState(state.teamA.chats) as unknown as Prisma.InputJsonValue,
      chatsTeamBState: this.serializeChatState(state.teamB.chats) as unknown as Prisma.InputJsonValue,
      skipState: Array.from(state.skipState),
      updatedAt: new Date(),
    }
  }

  // ─── Redis 캐시 로드 ────────────────────────────────────────────────────────
  private async loadStateFromCache(battleId: string): Promise<ActiveBattleState | null> {
    try {
      const [coreRaw, attacksRaw, defensesRaw, chatsAllRaw, chatsARaw, chatsBRaw] = await Promise.all([
        this.redis.get(this.getCoreKey(battleId)),
        this.redis.get(this.getAttacksKey(battleId)),
        this.redis.get(this.getDefensesKey(battleId)),
        this.redis.get(this.getChatsAllKey(battleId)),
        this.redis.get(this.getChatsAKey(battleId)),
        this.redis.get(this.getChatsBKey(battleId)),
      ])

      if (!coreRaw) return null

      const core = JSON.parse(coreRaw) as SerializedCore
      const attacks = attacksRaw ? (JSON.parse(attacksRaw) as SerializedAttacks) : { all: [], opinionHistory: [] }
      const defenses = defensesRaw ? (JSON.parse(defensesRaw) as SerializedDefenses) : { all: [] }
      const chatsAll = chatsAllRaw ? (JSON.parse(chatsAllRaw) as SerializedChats) : []
      const chatsA = chatsARaw ? (JSON.parse(chatsARaw) as SerializedChats) : []
      const chatsB = chatsBRaw ? (JSON.parse(chatsBRaw) as SerializedChats) : []

      const [teamAAttacks, teamBAttacks, teamADefenses, teamBDefenses] = await Promise.all([
        this.loadDiscussionsFromRedis(battleId, 'attack', BATTLE_TEAM.A),
        this.loadDiscussionsFromRedis(battleId, 'attack', BATTLE_TEAM.B),
        this.loadDiscussionsFromRedis(battleId, 'defense', BATTLE_TEAM.A),
        this.loadDiscussionsFromRedis(battleId, 'defense', BATTLE_TEAM.B),
      ])

      return this.assembleState(core, attacks, defenses, chatsAll, chatsA, chatsB, teamAAttacks, teamBAttacks, teamADefenses, teamBDefenses)
    } catch {
      return null
    }
  }

  private async loadDiscussionsFromRedis(battleId: string, type: 'attack' | 'defense', team: BattleTeam): Promise<BattleDiscussion[]> {
    const ids = await this.redis.smembers(this.getDiscussionSetKey(battleId, type, team))
    if (ids.length === 0) return []

    const pipeline = this.redis.pipeline()
    for (const id of ids) {
      pipeline.hgetall(this.getDiscussionHashKey(battleId, id))
      pipeline.smembers(this.getVoteVotersKey(battleId, id))
    }
    const results = (await pipeline.exec()) ?? []
    return ids
      .map((_, i) => ({
        hash: results[i * 2]?.[1] as Record<string, string> | null,
        voters: (results[i * 2 + 1]?.[1] as string[] | null) ?? [],
      }))
      .filter(({ hash }) => !!hash?.discussionId)
      .map(({ hash, voters }) => this.parseDiscussionHash(hash!, voters))
  }

  private parseDiscussionHash(hash: Record<string, string>, voters: string[]): BattleDiscussion {
    return {
      discussionId: hash.discussionId,
      author: {
        authorId: hash.authorId,
        nickname: hash.nickname,
      },
      type: hash.type as BattleDiscussionType,
      content: hash.content,
      upvotes: voters.length,
      votes: voters,
      status: hash.status as BattleDiscussionStatus,
      team: hash.team as BattleTeam,
      selectedAt: hash.selectedAt ? Number(hash.selectedAt) : undefined,
    }
  }

  private async patchSkipCache(battleId: string, skipList: Set<string>): Promise<void> {
    const coreRaw = await this.redis.get(this.getCoreKey(battleId))
    if (!coreRaw) return
    const core = JSON.parse(coreRaw) as SerializedCore
    core.skipState = Array.from(skipList)
    void this.redis
      .set(this.getCoreKey(battleId), JSON.stringify(core))
      .catch(err => this.logger.error(`[patchSkipCache] failed for ${battleId}: ${(err as Error).message}`))
  }

  // ─── 직렬화 ────────────────────────────────────────────────────────────────
  private serializeCore(state: ActiveBattleState): SerializedCore {
    return {
      battleId: state.battleId,
      status: state.status,
      round: state.round,
      topics: state.topics,
      totalRounds: state.totalRounds,
      phase: state.phase,
      phaseCount: state.phaseCount,
      startedAt: state.startedAt,
      expiredAt: state.expiredAt,
      skipState: Array.from(state.skipState),
      participants: [...state.participants.entries()],
      teamVotes: [...state.teamVotes.entries()],
      userInfoMap: [...state.userInfoMap.entries()],
      teamAUsers: [...state.teamA.users],
      teamBUsers: [...state.teamB.users],
      allRoomId: state.all.roomId,
      teamARoomId: state.teamA.roomId,
      teamBRoomId: state.teamB.roomId,
    }
  }

  private serializeAttacks(state: ActiveBattleState): SerializedAttacks {
    return {
      all: state.all.attacks,
      opinionHistory: state.opinionHistory,
    }
  }

  private serializeDefenses(state: ActiveBattleState): SerializedDefenses {
    return {
      all: state.all.defenses,
    }
  }

  private serializeChatState(chats: BattleChat[]): BattleChatSnapshot[] {
    return chats.map(chat => ({ ...chat, createdAt: chat.createdAt.toISOString() }))
  }

  private serializeParticipantsState(participants: Map<string, BattleTeam>): ParticipantEntry[] {
    return [...participants.entries()].map(([userId, team]) => ({ userId, team }))
  }

  private serializeTeamVotesState(teamVotes: Map<string, BattleTeam>): TeamVoteEntry[] {
    return [...teamVotes.entries()].map(([userId, team]) => ({ userId, team }))
  }

  private serializeUserInfoState(userInfoMap: Map<string, string>): UserInfoEntry[] {
    return [...userInfoMap.entries()].map(([userId, nickname]) => ({ userId, nickname }))
  }

  // ─── 역직렬화 ──────────────────────────────────────────────────────────────
  private assembleState(
    core: SerializedCore,
    attacks: SerializedAttacks,
    defenses: SerializedDefenses,
    chatsAll: SerializedChats,
    chatsA: SerializedChats,
    chatsB: SerializedChats,
    teamAAttacks: BattleDiscussion[],
    teamBAttacks: BattleDiscussion[],
    teamADefenses: BattleDiscussion[],
    teamBDefenses: BattleDiscussion[],
  ): ActiveBattleState {
    const participants = new Map<string, BattleTeam>(core.participants ?? [])
    const teamVotes = new Map<string, BattleTeam>(core.teamVotes ?? [])
    const userInfoMap = new Map<string, string>(core.userInfoMap ?? [])

    return {
      battleId: core.battleId,
      status: core.status ?? 'OPEN',
      all: {
        roomId: core.allRoomId,
        chats: this.parseChatState(chatsAll),
        attacks: attacks.all ?? [],
        defenses: defenses.all ?? [],
      },
      teamA: {
        roomId: core.teamARoomId,
        chats: this.parseChatState(chatsA),
        attacks: teamAAttacks,
        defenses: teamADefenses,
        users: core.teamAUsers ?? [],
      },
      teamB: {
        roomId: core.teamBRoomId,
        chats: this.parseChatState(chatsB),
        attacks: teamBAttacks,
        defenses: teamBDefenses,
        users: core.teamBUsers ?? [],
      },
      participants,
      teamVotes,
      userInfoMap,
      opinionHistory: attacks.opinionHistory ?? [],
      skipState: new Set(core.skipState ?? []),
      round: core.round,
      topics: core.topics,
      totalRounds: core.totalRounds,
      phase: core.phase,
      phaseCount: core.phaseCount,
      startedAt: core.startedAt,
      expiredAt: core.expiredAt,
    }
  }

  private buildStateFromBattle(battle: PrismaBattle): ActiveBattleState {
    const participants = this.parseTeamMap(battle.participantsState)
    const teamVotes = this.parseTeamMap(battle.teamVotesState)
    const userInfoMap = this.parseUserInfoState(battle.userInfoState)
    const attackState = this.parseTeamStateArray<BattleDiscussion>(battle.attacksState)
    const defenseState = this.parseTeamStateArray<BattleDefense>(battle.defensesState)
    const opinionHistory = this.parseOpinionHistoryState(battle.opinionHistoryState)
    const skipState = new Set<string>(Array.isArray(battle.skipState) ? battle.skipState : [])

    const playTime = BATTLE_PLAYTIME[battle.playTime as keyof typeof BATTLE_PLAYTIME]
    if (!playTime) throw new NotFoundException('올바르지 않은 배틀 진행 시간입니다.')

    const state: ActiveBattleState = {
      battleId: battle.id,
      status: battle.status ?? 'OPEN',
      all: {
        roomId: this.getBattleRoomId(battle.id),
        chats: this.parseChatState(battle.chatsAllState),
        attacks: attackState.all,
        defenses: defenseState.all,
      },
      teamA: {
        roomId: this.getBattleRoomId(battle.id, BATTLE_TEAM.A),
        users: [],
        chats: this.parseChatState(battle.chatsTeamAState),
        attacks: attackState.teamA,
        defenses: defenseState.teamA,
      },
      teamB: {
        roomId: this.getBattleRoomId(battle.id, BATTLE_TEAM.B),
        users: [],
        chats: this.parseChatState(battle.chatsTeamBState),
        attacks: attackState.teamB,
        defenses: defenseState.teamB,
      },
      participants,
      teamVotes,
      userInfoMap,
      opinionHistory,
      skipState,
      round: battle.currentRound ?? 1,
      topics: battle.topics,
      totalRounds: playTime.rounds,
      phase: (battle.currentPhase ?? BATTLE_PHASE.PENDING.name) as BattlePhaseName,
      phaseCount: battle.phaseCount ?? 1,
      startedAt: battle.startedAt ? battle.startedAt.getTime() : null,
      expiredAt: battle.expiredAt ? battle.expiredAt.getTime() : null,
    }

    this.rebuildTeamUsers(state)
    return state
  }

  // ─── 파싱 헬퍼 ─────────────────────────────────────────────────────────────
  private rebuildTeamUsers(state: ActiveBattleState): void {
    const entries = [...state.participants.entries()]
    state.teamA.users = entries.filter(([, team]) => team === BATTLE_TEAM.A).map(([userId]) => userId)
    state.teamB.users = entries.filter(([, team]) => team === BATTLE_TEAM.B).map(([userId]) => userId)
  }

  private parseChatState(value: unknown): BattleChat[] {
    if (!Array.isArray(value)) return []
    return (value as BattleChatSnapshot[])
      .filter(item => item && typeof item.createdAt === 'string')
      .map(item => ({ ...item, createdAt: new Date(item.createdAt) }))
  }

  private parseTeamMap(value: unknown): Map<string, BattleTeam> {
    if (!Array.isArray(value)) return new Map()
    return new Map(
      (value as Array<{ userId: string; team: string }>)
        .filter(item => item && typeof item.userId === 'string' && typeof item.team === 'string')
        .map(item => [item.userId, item.team as BattleTeam]),
    )
  }

  private parseUserInfoState(value: unknown): Map<string, string> {
    if (!Array.isArray(value)) return new Map()
    return new Map(
      (value as UserInfoEntry[])
        .filter(item => item && typeof item.userId === 'string' && typeof item.nickname === 'string')
        .map(item => [item.userId, item.nickname] as [string, string]),
    )
  }

  private parseTeamStateArray<T>(value: unknown): { teamA: (T | null)[]; teamB: (T | null)[]; all: (T | null)[] } {
    if (!value || typeof value !== 'object') return { teamA: [], teamB: [], all: [] }
    const obj = value as { teamA?: unknown; teamB?: unknown; all?: unknown }
    return {
      teamA: Array.isArray(obj.teamA) ? (obj.teamA as (T | null)[]) : [],
      teamB: Array.isArray(obj.teamB) ? (obj.teamB as (T | null)[]) : [],
      all: Array.isArray(obj.all) ? (obj.all as (T | null)[]) : [],
    }
  }

  private parseOpinionHistoryState(value: unknown): BattleDiscussion[] {
    if (!Array.isArray(value)) return []
    return value.filter(item => item && typeof item === 'object') as BattleDiscussion[]
  }

  private getBattleRoomId(battleId: string, team?: BattleTeam): string {
    return team ? `battle:${battleId}:${team}` : `battle:${battleId}`
  }
}
