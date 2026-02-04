import { Injectable, NotFoundException } from '@nestjs/common'
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

interface SerializedBattleState {
  battleId: string
  all: {
    roomId: string
    chats: BattleChatSnapshot[]
    attacks: (BattleDiscussion | null)[]
    defenses: (BattleDefense | null)[]
  }
  teamA: {
    roomId: string
    chats: BattleChatSnapshot[]
    attacks: (BattleDiscussion | null)[]
    defenses: (BattleDefense | null)[]
    users: string[]
  }
  teamB: {
    roomId: string
    chats: BattleChatSnapshot[]
    attacks: (BattleDiscussion | null)[]
    defenses: (BattleDefense | null)[]
    users: string[]
  }
  participants: [string, BattleTeam][]
  teamVotes: [string, BattleTeam][]
  userInfoMap: [string, string][]
  opinionHistory: BattleDiscussion[]
  skipState: string[]
  round: number
  topics: string[]
  totalRounds: number
  phase: BattlePhaseName
  phaseCount: number
  startedAt: number | null
  expiredAt: number | null
}

@Injectable()
export class BattleStateRepositoryAdapter implements BattleStatePort {
  private readonly cachePrefix = 'battle:state:'

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisRepository,
  ) {}

  async loadBattleState(battleId: string): Promise<{ battle: PrismaBattle; state: ActiveBattleState }> {
    const cachedState = await this.loadStateFromCache(battleId)

    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })
    if (!battle) throw new NotFoundException('배틀이 존재하지 않습니다.')

    //캐시에서 가져온 데이터가 있으면 바로 반환
    if (cachedState) {
      return { battle, state: cachedState }
    }

    const state = this.buildStateFromBattle(battle)
    await this.persistStateCache(state)
    return { battle, state }
  }

  async saveBattleState(battleId: string, state: ActiveBattleState): Promise<void> {
    await this.prisma.battle.update({
      where: { id: battleId },
      data: {
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
      },
    })
    await this.persistStateCache(state)
  }

  async updateSkipState(battleId: string, skipList: Set<string>): Promise<void> {
    await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        skipState: Array.from(skipList),
        updatedAt: new Date(),
      },
    })
    await this.patchSkipCache(battleId, skipList)
  }

  parseMvpsState(value: unknown): Mvp[] {
    if (!Array.isArray(value)) return []
    return value
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const mvp = item as Partial<Mvp>
        const team: 'A' | 'B' | 'NONE' = mvp.team === 'A' ? 'A' : mvp.team === 'B' ? 'B' : 'NONE'
        const parsed: Mvp = {
          userId: typeof mvp.userId === 'string' ? mvp.userId : '',
          nickname: typeof mvp.nickname === 'string' ? mvp.nickname : '',
          team,
          score: typeof mvp.score === 'number' ? mvp.score : 0,
          totalVotes: typeof mvp.totalVotes === 'number' ? mvp.totalVotes : 0,
          opinionCount: typeof mvp.opinionCount === 'number' ? mvp.opinionCount : 0,
          selectedOpinionCount: typeof mvp.selectedOpinionCount === 'number' ? mvp.selectedOpinionCount : 0,
          joinedAt: typeof mvp.joinedAt === 'number' ? mvp.joinedAt : 0,
        }
        return parsed
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

  private parseParticipantsState(value: unknown): Map<string, BattleTeam> {
    if (!Array.isArray(value)) return new Map()
    const entries = (value as ParticipantEntry[])
      .filter(item => item && typeof item.userId === 'string' && typeof item.team === 'string')
      .map(item => [item.userId, item.team] as [string, BattleTeam])
    return new Map(entries)
  }

  private parseTeamVotesState(value: unknown): Map<string, BattleTeam> {
    if (!Array.isArray(value)) return new Map()
    const entries = (value as TeamVoteEntry[])
      .filter(item => item && typeof item.userId === 'string' && typeof item.team === 'string')
      .map(item => [item.userId, item.team] as [string, BattleTeam])
    return new Map(entries)
  }

  private parseUserInfoState(value: unknown): Map<string, string> {
    if (!Array.isArray(value)) return new Map()
    const entries = (value as UserInfoEntry[])
      .filter(item => item && typeof item.userId === 'string' && typeof item.nickname === 'string')
      .map(item => [item.userId, item.nickname] as [string, string])
    return new Map(entries)
  }

  private parseChatState(value: unknown): BattleChat[] {
    if (!Array.isArray(value)) return []
    return (value as BattleChatSnapshot[])
      .filter(item => item && typeof item.createdAt === 'string')
      .map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }))
  }

  private serializeChatState(chats: BattleChat[]): BattleChatSnapshot[] {
    return chats.map(chat => ({
      ...chat,
      createdAt: chat.createdAt.toISOString(),
    }))
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

  private parseAttackState(value: unknown): {
    teamA: (BattleDiscussion | null)[]
    teamB: (BattleDiscussion | null)[]
    all: (BattleDiscussion | null)[]
  } {
    if (!value || typeof value !== 'object') {
      return { teamA: [], teamB: [], all: [] }
    }
    const obj = value as { teamA?: unknown; teamB?: unknown; all?: unknown }
    return {
      teamA: Array.isArray(obj.teamA) ? (obj.teamA as (BattleDiscussion | null)[]) : [],
      teamB: Array.isArray(obj.teamB) ? (obj.teamB as (BattleDiscussion | null)[]) : [],
      all: Array.isArray(obj.all) ? (obj.all as (BattleDiscussion | null)[]) : [],
    }
  }

  private parseDefenseState(value: unknown): {
    teamA: (BattleDefense | null)[]
    teamB: (BattleDefense | null)[]
    all: (BattleDefense | null)[]
  } {
    if (!value || typeof value !== 'object') {
      return { teamA: [], teamB: [], all: [] }
    }
    const obj = value as { teamA?: unknown; teamB?: unknown; all?: unknown }
    return {
      teamA: Array.isArray(obj.teamA) ? (obj.teamA as (BattleDefense | null)[]) : [],
      teamB: Array.isArray(obj.teamB) ? (obj.teamB as (BattleDefense | null)[]) : [],
      all: Array.isArray(obj.all) ? (obj.all as (BattleDefense | null)[]) : [],
    }
  }

  private parseOpinionHistoryState(value: unknown): BattleDiscussion[] {
    if (!Array.isArray(value)) return []
    return value.filter(item => item && typeof item === 'object') as BattleDiscussion[]
  }

  //캐시에서 가져오기
  private async loadStateFromCache(battleId: string): Promise<ActiveBattleState | null> {
    try {
      const payload = await this.redis.get(this.getCacheKey(battleId))
      if (!payload) return null
      return this.deserializeState(JSON.parse(payload) as SerializedBattleState)
    } catch {
      return null
    }
  }

  //캐시에 저장하기
  private async persistStateCache(state: ActiveBattleState): Promise<void> {
    const payload = this.serializeState(state)
    await this.redis.set(this.getCacheKey(state.battleId), JSON.stringify(payload))
  }

  //skipState 업데이트 시 캐시 업데이트
  private async patchSkipCache(battleId: string, skipList: Set<string>): Promise<void> {
    const cachedState = await this.loadStateFromCache(battleId)
    if (!cachedState) return
    cachedState.skipState = new Set(skipList)
    await this.persistStateCache(cachedState)
  }

  //캐시에 저장할 데이터 직렬화
  private serializeState(state: ActiveBattleState): SerializedBattleState {
    return {
      battleId: state.battleId,
      all: {
        roomId: state.all.roomId,
        chats: this.serializeChatState(state.all.chats),
        attacks: state.all.attacks,
        defenses: state.all.defenses,
      },
      teamA: {
        roomId: state.teamA.roomId,
        chats: this.serializeChatState(state.teamA.chats),
        attacks: state.teamA.attacks,
        defenses: state.teamA.defenses,
        users: [...state.teamA.users],
      },
      teamB: {
        roomId: state.teamB.roomId,
        chats: this.serializeChatState(state.teamB.chats),
        attacks: state.teamB.attacks,
        defenses: state.teamB.defenses,
        users: [...state.teamB.users],
      },
      participants: [...state.participants.entries()],
      teamVotes: [...state.teamVotes.entries()],
      userInfoMap: [...state.userInfoMap.entries()],
      opinionHistory: state.opinionHistory,
      skipState: Array.from(state.skipState),
      round: state.round,
      topics: state.topics,
      totalRounds: state.totalRounds,
      phase: state.phase,
      phaseCount: state.phaseCount,
      startedAt: state.startedAt,
      expiredAt: state.expiredAt,
    }
  }

  //캐시에서 가져온 데이터 역직렬화
  private deserializeState(payload: SerializedBattleState): ActiveBattleState {
    const participants = new Map<string, BattleTeam>(payload.participants ?? [])
    const teamVotes = new Map<string, BattleTeam>(payload.teamVotes ?? [])
    const userInfoMap = new Map<string, string>(payload.userInfoMap ?? [])

    const state: ActiveBattleState = {
      battleId: payload.battleId,
      all: {
        roomId: payload.all.roomId,
        chats: this.parseChatState(payload.all.chats),
        attacks: payload.all.attacks ?? [],
        defenses: payload.all.defenses ?? [],
      },
      teamA: {
        roomId: payload.teamA.roomId,
        chats: this.parseChatState(payload.teamA.chats),
        attacks: payload.teamA.attacks ?? [],
        defenses: payload.teamA.defenses ?? [],
        users: payload.teamA.users ?? [],
      },
      teamB: {
        roomId: payload.teamB.roomId,
        chats: this.parseChatState(payload.teamB.chats),
        attacks: payload.teamB.attacks ?? [],
        defenses: payload.teamB.defenses ?? [],
        users: payload.teamB.users ?? [],
      },
      participants,
      teamVotes,
      userInfoMap,
      opinionHistory: payload.opinionHistory ?? [],
      skipState: new Set(payload.skipState ?? []),
      round: payload.round,
      topics: payload.topics,
      totalRounds: payload.totalRounds,
      phase: payload.phase,
      phaseCount: payload.phaseCount,
      startedAt: payload.startedAt,
      expiredAt: payload.expiredAt,
    }

    this.rebuildTeamUsers(state)
    return state
  }

  //데이터베이스에서 가져온 데이터 빌드
  private buildStateFromBattle(battle: PrismaBattle): ActiveBattleState {
    const participants = this.parseParticipantsState(battle.participantsState)
    const teamVotes = this.parseTeamVotesState(battle.teamVotesState)
    const userInfoMap = this.parseUserInfoState(battle.userInfoState)
    const attackState = this.parseAttackState(battle.attacksState)
    const defenseState = this.parseDefenseState(battle.defensesState)
    const opinionHistory = this.parseOpinionHistoryState(battle.opinionHistoryState)
    const skipState = new Set<string>(Array.isArray(battle.skipState) ? battle.skipState : [])

    const playTime = BATTLE_PLAYTIME[battle.playTime as keyof typeof BATTLE_PLAYTIME]
    if (!playTime) {
      throw new NotFoundException('올바르지 않은 배틀 진행 시간입니다.')
    }

    const state: ActiveBattleState = {
      battleId: battle.id,
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

  private rebuildTeamUsers(state: ActiveBattleState): void {
    state.teamA.users = []
    state.teamB.users = []

    for (const [userId, team] of state.participants.entries()) {
      if (team === BATTLE_TEAM.A) state.teamA.users.push(userId)
      if (team === BATTLE_TEAM.B) state.teamB.users.push(userId)
    }
  }

  private getCacheKey(battleId: string): string {
    return `${this.cachePrefix}${battleId}`
  }

  private getBattleRoomId(battleId: string, team?: BattleTeam): string {
    return team ? `battle:${battleId}:${team}` : `battle:${battleId}`
  }
}
