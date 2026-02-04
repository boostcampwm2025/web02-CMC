import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from 'generated/prisma/client'
import { type Battle as PrismaBattle } from 'generated/prisma/client'
import { PrismaService } from '../../../../prisma/prisma.service'
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

@Injectable()
export class BattleStateRepositoryAdapter implements BattleStatePort {
  constructor(private readonly prisma: PrismaService) {}

  async loadBattleState(battleId: string): Promise<{ battle: PrismaBattle; state: ActiveBattleState }> {
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })
    if (!battle) throw new NotFoundException('배틀이 존재하지 않습니다.')

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
      battleId,
      all: {
        roomId: this.getBattleRoomId(battleId),
        chats: this.parseChatState(battle.chatsAllState),
        attacks: attackState.all,
        defenses: defenseState.all,
      },
      teamA: {
        roomId: this.getBattleRoomId(battleId, BATTLE_TEAM.A),
        users: [],
        chats: this.parseChatState(battle.chatsTeamAState),
        attacks: attackState.teamA,
        defenses: defenseState.teamA,
      },
      teamB: {
        roomId: this.getBattleRoomId(battleId, BATTLE_TEAM.B),
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
  }

  async updateSkipState(battleId: string, skipList: Set<string>): Promise<void> {
    await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        skipState: Array.from(skipList),
        updatedAt: new Date(),
      },
    })
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

  private rebuildTeamUsers(state: ActiveBattleState): void {
    state.teamA.users = []
    state.teamB.users = []

    for (const [userId, team] of state.participants.entries()) {
      if (team === BATTLE_TEAM.A) state.teamA.users.push(userId)
      if (team === BATTLE_TEAM.B) state.teamB.users.push(userId)
    }
  }

  private getBattleRoomId(battleId: string, team?: BattleTeam): string {
    return team ? `battle:${battleId}:${team}` : `battle:${battleId}`
  }
}
