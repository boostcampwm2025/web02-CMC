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
import { BATTLE_PHASE, BATTLE_PLAYTIME, BATTLE_STATUS, BATTLE_TEAM } from '../../../domains/models/const/battles.const'
import type { Mvp } from '../../../domains/models/types/battleResult.types'
import { BattleStatePort } from '../../../application/ports/out/battleState.port'

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

interface BattleChatSnapshot extends Omit<BattleChat, 'createdAt'> {
  createdAt: string
}

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

  private getDiscussionKey(battleId: string, discussionId: string): string {
    return `battle:${battleId}:discussion:${discussionId}`
  }

  private getDiscussionIdsKey(battleId: string, type: 'attack' | 'defense', team: BattleTeam): string {
    return `battle:${battleId}:discussions:${type}:${team}`
  }

  private getDiscussionIdsIndexKey(battleId: string): string {
    return `battle:${battleId}:discussion:ids`
  }

  private getDiscussionVotesKey(battleId: string, discussionId: string): string {
    return `battle:${battleId}:discussion:${discussionId}:votes`
  }

  private getUserCurrentVoteKey(battleId: string, userId: string): string {
    return `battle:${battleId}:user:${userId}:vote`
  }

  private getBattleRoomKey(battleId: string, team?: BattleTeam): string {
    return team ? `battle:${battleId}:room:${team}` : `battle:${battleId}:room:all`
  }

  //배틀 상태 로드
  async loadBattleState(battleId: string): Promise<{ battle: PrismaBattle; state: ActiveBattleState }> {
    const live = this.liveStates.get(battleId)
    if (live) {
      return { battle: { id: battleId, status: live.status } as PrismaBattle, state: live }
    }

    const statusRow = await this.prisma.battle.findUnique({ where: { id: battleId }, select: { status: true } })
    if (!statusRow) throw new NotFoundException('배틀이 존재하지 않습니다.')

    //배틀이 종료된 경우 Redis 삭제 후 DB에서 상태 로드
    if (statusRow.status === BATTLE_STATUS.CLOSED) {
      const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })
      if (!battle) throw new NotFoundException('배틀이 존재하지 않습니다.')

      const state = this.buildStateFromBattle(battle)
      this.liveStates.set(battleId, state)

      void this.clearBattleStateFromRedis(battleId).catch(err =>
        this.logger.error(`[loadBattleState] Redis 삭제 실패 ${battleId}: ${(err as Error).message}`),
      )
      return { battle, state }
    }

    //캐시에서 상태 로드
    const cached = await this.loadBattleStateFromRedis(battleId)
    if (cached) {
      this.liveStates.set(battleId, cached)
      return { battle: { id: battleId, status: cached.status } as PrismaBattle, state: cached }
    }

    //캐시에서 상태 로드 실패 시 데이터베이스에서 상태 로드
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })
    if (!battle) throw new NotFoundException('배틀이 존재하지 않습니다.')

    //배틀 상태 생성
    const state = this.buildStateFromBattle(battle)

    //배틀 상태 저장
    this.liveStates.set(battleId, state)
    this.flushAllToRedis(state)
    return { battle, state }
  }

  //배틀 상태 저장
  saveBattleState(battleId: string, state: ActiveBattleState): void {
    this.liveStates.set(battleId, state)
    if (state.status !== BATTLE_STATUS.CLOSED) {
      this.flushAllToRedis(state)
    }
    this.flushToDB(battleId, state)
  }

  async updateSkipState(battleId: string, skipList: Set<string>): Promise<void> {
    const live = this.liveStates.get(battleId)
    if (live) {
      live.skipState = new Set(skipList)
      const coreJson = JSON.stringify(this.serializeCore(live))
      void this.redis
        .set(this.getCoreKey(battleId), coreJson)
        .catch(err => this.logger.error(`[updateSkipState] Redis 업데이트 실패 ${battleId}: ${(err as Error).message}`))
    } else {
      await this.patchSkipCache(battleId, skipList)
    }

    this.prisma.battle
      .update({ where: { id: battleId }, data: { skipState: Array.from(skipList), updatedAt: new Date() } })
      .catch(err => this.logger.error(`[updateSkipState] DB 업데이트 실패 ${battleId}: ${(err as Error).message}`))
  }

  // 배틀 종료 시 인메모리, Redis 삭제
  async clearBattleStateFromRedis(battleId: string): Promise<void> {
    const keys = await this.getBattleStateKeys(battleId)

    this.liveStates.delete(battleId)

    if (keys.length > 0) {
      await this.redis.mdel(keys)
    }
  }

  //discussion 메타데이터를 Redis HASH에 저장
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
      this.redis.hmset(this.getDiscussionKey(battleId, discussion.discussionId), hashData),
      this.redis.sadd(this.getDiscussionIdsKey(battleId, discussionType, team), discussion.discussionId),
      this.redis.sadd(this.getDiscussionIdsIndexKey(battleId), discussion.discussionId),
    ])
  }

  //phase 전환 시 discussion Redis 키를 정리
  async resetPhaseDiscussionsInRedis(battleId: string, discussionType: 'attack' | 'defense', teams: BattleTeam[]): Promise<void> {
    const setKeys = teams.map(team => this.getDiscussionIdsKey(battleId, discussionType, team))
    const allIds = await Promise.all(setKeys.map(key => this.redis.smembers(key)))

    const keysToDelete = [...setKeys, ...allIds.flat().flatMap(id => [this.getDiscussionKey(battleId, id), this.getDiscussionVotesKey(battleId, id)])]

    if (keysToDelete.length > 0) {
      await this.redis.mdel(keysToDelete)
    }
  }

  // atomic vote 처리 Lua 스크립트
  private readonly CAST_VOTE_LUA = `
local added = redis.call('SADD', KEYS[1], ARGV[1])
if added == 0 then
  return {0}
end
local prev = redis.call('GETSET', KEYS[2], ARGV[2])
if prev and prev ~= '' and prev ~= ARGV[2] then
  redis.call('SREM', ARGV[3] .. prev .. ':votes', ARGV[1])
end
return {1, prev}
`
  // Redis에서 atomic vote 처리
  async castVoteInRedis(battleId: string, discussionId: string, userId: string): Promise<{ added: boolean; prevDiscussionId: string | null }> {
    const voteKeyPrefix = `battle:${battleId}:discussion:`

    const votersKey = this.getDiscussionVotesKey(battleId, discussionId)
    const userVoteKey = this.getUserCurrentVoteKey(battleId, userId)

    // Lua 스크립트 실행
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
  // 배틀 상태 Redis 저장
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

  // 배틀 상태 DB 업데이트
  private flushToDB(battleId: string, state: ActiveBattleState): void {
    this.prisma.battle
      .update({ where: { id: battleId }, data: this.buildUpdateData(state) })
      .catch(err => this.logger.error(`[flushToDB] failed for ${battleId}: ${(err as Error).message}`))
  }

  // 배틀 상태 DB용 데이터 생성
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

  // Redis에서 배틀 상태 로드
  private async loadBattleStateFromRedis(battleId: string): Promise<ActiveBattleState | null> {
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
      const chatsAll = chatsAllRaw ? (JSON.parse(chatsAllRaw) as BattleChatSnapshot[]) : []
      const chatsA = chatsARaw ? (JSON.parse(chatsARaw) as BattleChatSnapshot[]) : []
      const chatsB = chatsBRaw ? (JSON.parse(chatsBRaw) as BattleChatSnapshot[]) : []

      const [teamAAttacks, teamBAttacks, teamADefenses, teamBDefenses] = await Promise.all([
        this.loadDiscussionsFromRedis(battleId, 'attack', BATTLE_TEAM.A),
        this.loadDiscussionsFromRedis(battleId, 'attack', BATTLE_TEAM.B),
        this.loadDiscussionsFromRedis(battleId, 'defense', BATTLE_TEAM.A),
        this.loadDiscussionsFromRedis(battleId, 'defense', BATTLE_TEAM.B),
      ])

      return this.deserializeState(core, attacks, defenses, chatsAll, chatsA, chatsB, teamAAttacks, teamBAttacks, teamADefenses, teamBDefenses)
    } catch {
      return null
    }
  }

  // Redis에서 discussion 메타데터 로드
  private async loadDiscussionsFromRedis(battleId: string, type: 'attack' | 'defense', team: BattleTeam): Promise<BattleDiscussion[]> {
    const ids = await this.redis.smembers(this.getDiscussionIdsKey(battleId, type, team))
    if (ids.length === 0) return []

    const pipeline = this.redis.pipeline()
    for (const id of ids) {
      pipeline.hgetall(this.getDiscussionKey(battleId, id))
      pipeline.smembers(this.getDiscussionVotesKey(battleId, id))
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

  //배틀 상태 Redis 키 조회
  private async getBattleStateKeys(battleId: string): Promise<string[]> {
    const discussionIds = await this.redis.smembers(this.getDiscussionIdsIndexKey(battleId))

    const discussionKeys = discussionIds.flatMap(id => [this.getDiscussionKey(battleId, id), this.getDiscussionVotesKey(battleId, id)])

    const stateKeys = [
      this.getCoreKey(battleId),
      this.getAttacksKey(battleId),
      this.getDefensesKey(battleId),
      this.getChatsAllKey(battleId),
      this.getChatsAKey(battleId),
      this.getChatsBKey(battleId),
      this.getDiscussionIdsIndexKey(battleId),
    ]

    const userVoteKeys = await this.getUserVoteKeys(battleId)

    return [...stateKeys, ...discussionKeys, ...userVoteKeys]
  }

  //유저별 현재 투표 discussion 키 조회
  private async getUserVoteKeys(battleId: string): Promise<string[]> {
    const live = this.liveStates.get(battleId)
    if (live && live.participants.size > 0) {
      return [...live.participants.keys()].map(uid => this.getUserCurrentVoteKey(battleId, uid))
    }

    const coreRaw = await this.redis.get(this.getCoreKey(battleId))
    if (!coreRaw) return []

    const core = JSON.parse(coreRaw) as SerializedCore
    const pairs = Array.isArray(core.participants) ? core.participants : []
    const userIds = pairs.map(([userId]) => userId).filter((id): id is string => typeof id === 'string')
    return [...new Set(userIds)].map(uid => this.getUserCurrentVoteKey(battleId, uid))
  }

  // Redis에서 discussion 메타데이터 파싱
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

  // Redis에서 skip 상태 업데이트
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

  private serializeParticipantsState(participants: Map<string, BattleTeam>): [string, BattleTeam][] {
    return [...participants.entries()]
  }

  private serializeTeamVotesState(teamVotes: Map<string, BattleTeam>): [string, BattleTeam][] {
    return [...teamVotes.entries()]
  }

  private serializeUserInfoState(userInfoMap: Map<string, string>): [string, string][] {
    return [...userInfoMap.entries()]
  }

  // ─── 역직렬화 ──────────────────────────────────────────────────────────────
  private deserializeState(
    core: SerializedCore,
    attacks: SerializedAttacks,
    defenses: SerializedDefenses,
    chatsAll: BattleChatSnapshot[],
    chatsA: BattleChatSnapshot[],
    chatsB: BattleChatSnapshot[],
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
        chats: this.restoreChatState(chatsAll),
        attacks: attacks.all ?? [],
        defenses: defenses.all ?? [],
      },
      teamA: {
        roomId: core.teamARoomId,
        chats: this.restoreChatState(chatsA),
        attacks: teamAAttacks,
        defenses: teamADefenses,
        users: core.teamAUsers ?? [],
      },
      teamB: {
        roomId: core.teamBRoomId,
        chats: this.restoreChatState(chatsB),
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
    //참가자, 투표, 유저 정보 복원
    const participants = this.restoreMap<string, BattleTeam>(battle.participantsState)
    const teamVotes = this.restoreMap<string, BattleTeam>(battle.teamVotesState)
    const userInfoMap = this.restoreMap<string, string>(battle.userInfoState)

    const attackStateRaw = this.normalizeTeamState(battle.attacksState)
    const defenseStateRaw = this.normalizeTeamState(battle.defensesState)

    //공격 상태 복원
    const attackState = {
      teamA: attackStateRaw.teamA as (BattleDiscussion | null)[],
      teamB: attackStateRaw.teamB as (BattleDiscussion | null)[],
      all: attackStateRaw.all as (BattleDiscussion | null)[],
    }

    //방어 상태 복원
    const defenseState = {
      teamA: defenseStateRaw.teamA as (BattleDefense | null)[],
      teamB: defenseStateRaw.teamB as (BattleDefense | null)[],
      all: defenseStateRaw.all as (BattleDefense | null)[],
    }

    const opinionHistory = (battle.opinionHistoryState as BattleDiscussion[] | null) ?? []
    const skipState = new Set<string>(Array.isArray(battle.skipState) ? battle.skipState : [])

    const playTime = BATTLE_PLAYTIME[battle.playTime as keyof typeof BATTLE_PLAYTIME]
    if (!playTime) throw new NotFoundException('올바르지 않은 배틀 진행 시간입니다.')

    const state: ActiveBattleState = {
      battleId: battle.id,
      status: battle.status ?? 'OPEN',
      all: {
        roomId: this.getBattleRoomKey(battle.id),
        chats: this.restoreChatState(battle.chatsAllState),
        attacks: attackState.all,
        defenses: defenseState.all,
      },
      teamA: {
        roomId: this.getBattleRoomKey(battle.id, BATTLE_TEAM.A),
        users: [],
        chats: this.restoreChatState(battle.chatsTeamAState),
        attacks: attackState.teamA,
        defenses: defenseState.teamA,
      },
      teamB: {
        roomId: this.getBattleRoomKey(battle.id, BATTLE_TEAM.B),
        users: [],
        chats: this.restoreChatState(battle.chatsTeamBState),
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

  private rebuildTeamUsers(state: ActiveBattleState): void {
    const entries = [...state.participants.entries()]
    state.teamA.users = entries.filter(([, team]) => team === BATTLE_TEAM.A).map(([userId]) => userId)
    state.teamB.users = entries.filter(([, team]) => team === BATTLE_TEAM.B).map(([userId]) => userId)
  }

  // Redis에 저장된 팀 상태 복원
  private normalizeTeamState(value: unknown) {
    const state = (value ?? {}) as {
      teamA?: unknown[]
      teamB?: unknown[]
      all?: unknown[]
    }

    return {
      teamA: Array.isArray(state.teamA) ? state.teamA : [],
      teamB: Array.isArray(state.teamB) ? state.teamB : [],
      all: Array.isArray(state.all) ? state.all : [],
    }
  }

  // redis에서 채팅 상태 복원
  private restoreChatState(value: unknown): BattleChat[] {
    const chats = value as BattleChatSnapshot[] | null
    return chats ? chats.map(chat => ({ ...chat, createdAt: new Date(chat.createdAt) })) : []
  }

  // Redis에 배열 형태로 저장된 Map snapshot을 Map으로 복원
  private restoreMap<K, V>(value: unknown): Map<K, V> {
    return new Map((value as [K, V][]) ?? [])
  }
}
