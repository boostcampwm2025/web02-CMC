import { v7 as uuidv7 } from 'uuid'
import { EventEmitter } from 'node:events'
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common'

import { TimelineItem, Mvp, BattleResult } from '../types/battleResult.types'
import { calculateOpinionScore, compareMvpCandidates, createMvpCandidate, applyWinnerBonus } from './utils/mvp.util'
import {
  ActiveBattleState,
  Battle,
  BattleCategory,
  BattlePhase,
  BattlePhaseName,
  BattleLanguage,
  BattleStatus,
  BattleTeam,
  BattleDiscussion,
  BattleDefense,
  BattleChat,
  BattlePlayTime,
  BattleTopOpinions,
  BattlePlayTimeName,
  ParticipantEntry,
  TeamVoteEntry,
  UserInfoEntry,
  BattleChatSnapshot,
} from '../types/battles.types'
import { BattleChatDto } from '../dto/battleChat.dto'
import type { BattleTeamVoteDto } from '../dto/battleTeamVote.dto'
import { BattleResponseDto } from '../dto/battleResponse.dto'
import { BattleResultResponseDto } from '../dto/battleResult.dto'
import { BattleJoinRequestDto } from '../dto/battleJoinRequest.dto'
import type { BattleCreateQueryDto } from '../dto/battleCreateQuery.dto'
import { ClosedBattleResponseDto } from '../dto/closedBattleResponse.dto'
import { BattleJoinInfoResponseDto } from '../dto/battleJoinResponse.dto'
import {
  BATTLE_CHAT_SCOPE,
  BATTLE_PHASE,
  BATTLE_PLAYTIME,
  BATTLE_STATUS,
  BATTLE_TEAM,
  BATTLE_TYPE,
  BATTLE_DISCUSSION_TYPE,
  BATTLE_MAX_PHASE_COUNT,
  MVP_DISPLAY_COUNT,
} from '../const/battles.const'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../dto/battleTurnResponse.dto'
import { DiscussionVoteResponseDto } from '../dto/discussionVoteResponse.dto'
import { DiscussionVoteResultDto } from '../dto/discussionVoteResult.dto'
import { BattleClosedResponseDto } from '../dto/battleClosedResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../dto/battleTeamUpdateAllResponse.dto'
import { BattleUserUpdateResponseDto } from '../dto/battleUserUpdateResponse.dto'
import { GuestAccount } from '../types/auth.types'
import { BattleLeaveResponseDto } from '../dto/battleLeaveResponse.dto'
import { generateNickname } from './utils/nickname.util'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma, type Battle as PrismaBattle } from 'generated/prisma/client'

@Injectable()
export class BattlesService extends EventEmitter {
  private battleTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(private readonly prisma: PrismaService) {
    super()
  }

  private generateId(): string {
    return uuidv7()
  }

  private getPlayTime(playTimeName: string): BattlePlayTime {
    const playTime = BATTLE_PLAYTIME[playTimeName as BattlePlayTimeName]
    if (!playTime) {
      throw new BadRequestException('올바르지 않은 배틀 진행 시간입니다.')
    }
    return playTime
  }

  private toBattleEntity(
    record: {
      id: string
      userId: string
      title: string
      description: string
      codeA: string
      codeB: string
      language: string
      category: string
      playTime: string
      topics: string[]
      password: string | null
      isPrivate: boolean
      status: string
      createdAt: Date
      updatedAt: Date | null
    },
    participantCount: number,
  ): Battle {
    const playTime = this.getPlayTime(record.playTime)

    return {
      id: record.id,
      authorId: record.userId,
      title: record.title,
      description: record.description,
      aCode: record.codeA,
      bCode: record.codeB,
      language: record.language as BattleLanguage,
      type: record.isPrivate ? BATTLE_TYPE.PRIVATE : BATTLE_TYPE.PUBLIC,
      category: record.category as BattleCategory,
      playTime,
      topics: record.topics,
      password: record.password ?? undefined,
      status: record.status as BattleStatus,
      participantCount,
      initialState: {
        round: 1,
        phase: BATTLE_PHASE.OPINION_SHARE.name,
        phaseCount: 1,
        timeRemainingSeconds: playTime.time * 60,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt ?? record.createdAt,
    }
  }

  private buildResult(teamACount: number, teamBCount: number, totalParticipantsCount?: number | null, winningTeam?: string | null): BattleResult {
    const total = totalParticipantsCount ?? teamACount + teamBCount
    const neutral = Math.max(total - teamACount - teamBCount, 0)
    const percentage = (votes: number) => (total === 0 ? 0 : Math.round((votes / total) * 100))
    const winner = winningTeam ?? (teamACount === teamBCount ? 'DRAW' : teamACount > teamBCount ? 'A' : 'B')

    return {
      winner: winner as BattleResult['winner'],
      teamA: { votes: teamACount, percentage: percentage(teamACount) },
      teamB: { votes: teamBCount, percentage: percentage(teamBCount) },
      neutral: { votes: neutral, percentage: percentage(neutral) },
    }
  }

  private normalizeTimeline(timeline: unknown): TimelineItem[] {
    return Array.isArray(timeline) ? (timeline as TimelineItem[]) : []
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

  private parseMvpsState(value: unknown): Mvp[] {
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

  private buildLegacyMvpsFromNicknames(nicknames: string[], timeline: TimelineItem[]): Mvp[] {
    return nicknames.map((nickname, index) => {
      const fromTimeline = timeline.find(item => item.author.nickname === nickname)
      return {
        userId: fromTimeline?.author.id ?? `legacy-mvp-${index}`,
        nickname,
        team: fromTimeline?.team === 'B' ? 'B' : 'A',
        score: 0,
        totalVotes: 0,
        opinionCount: 0,
        selectedOpinionCount: 0,
        joinedAt: 0,
      }
    })
  }

  private async loadBattleState(battleId: string): Promise<{ battle: PrismaBattle; state: ActiveBattleState }> {
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })
    if (!battle) throw new NotFoundException('배틀이 존재하지 않습니다.')

    const participants = this.parseParticipantsState(battle.participantsState)
    const teamVotes = this.parseTeamVotesState(battle.teamVotesState)
    const userInfoMap = this.parseUserInfoState(battle.userInfoState)
    const attackState = this.parseAttackState(battle.attacksState)
    const defenseState = this.parseDefenseState(battle.defensesState)
    const opinionHistory = this.parseOpinionHistoryState(battle.opinionHistoryState)

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
      round: battle.currentRound ?? 1,
      topics: battle.topics,
      totalRounds: this.getPlayTime(battle.playTime).rounds,
      phase: (battle.currentPhase ?? BATTLE_PHASE.PENDING.name) as BattlePhaseName,
      phaseCount: battle.phaseCount ?? 1,
      startedAt: battle.startedAt ? battle.startedAt.getTime() : null,
      expiredAt: battle.expiredAt ? battle.expiredAt.getTime() : null,
    }

    this.rebuildTeamUsers(state)
    return { battle, state }
  }

  private async saveBattleState(battleId: string, state: ActiveBattleState): Promise<void> {
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
        updatedAt: new Date(),
      },
    })
  }

  async create(payload: BattleCreateQueryDto): Promise<Battle> {
    const now = new Date()
    const battleId = this.generateId()
    const shuffledTopics = this.shuffleTopics(payload.topics, payload.playTime)
    const isPrivate = payload.type === BATTLE_TYPE.PRIVATE

    const created = await this.prisma.battle.create({
      data: {
        id: battleId,
        userId: payload.authorId,
        title: payload.title.trim(),
        description: payload.description.trim(),
        codeA: payload.aCode,
        codeB: payload.bCode,
        language: payload.language,
        category: payload.category,
        playTime: payload.playTime,
        topics: shuffledTopics,
        password: isPrivate ? (payload.password?.trim() ?? null) : null,
        isPrivate,
        status: BATTLE_STATUS.PENDING,
        createdAt: now,
        updatedAt: now,
        currentRound: 1,
        currentPhase: BATTLE_PHASE.PENDING.name,
        phaseCount: 1,
        startedAt: null,
        expiredAt: null,
        participantsState: [],
        teamVotesState: [],
        userInfoState: [],
        attacksState: { teamA: [], teamB: [], all: [] },
        defensesState: { teamA: [], teamB: [], all: [] },
        opinionHistoryState: [],
        chatsAllState: [],
        chatsTeamAState: [],
        chatsTeamBState: [],
      },
    })

    const battle = this.toBattleEntity(created, 1)

    return battle
  }

  //Todo: 정렬 기준 재설정
  //실시간 배틀 목록 조회
  async getOpenBattles(limit: number, offset: number) {
    const where = {
      isPrivate: false,
      status: { in: [BATTLE_STATUS.OPEN, BATTLE_STATUS.PENDING] },
    }

    const [battles, total] = await Promise.all([
      this.prisma.battle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.battle.count({ where }),
    ])

    const mapped = battles.map(battle => this.toBattleEntity(battle, 0))

    return {
      battles: BattleResponseDto.of(mapped),
      meta: {
        offset,
        limit,
        total,
      },
    }
  }

  //지난 배틀 조회
  async getClosedBattles(limit: number, offset: number) {
    const where = { status: BATTLE_STATUS.CLOSED }

    const [records, total] = await Promise.all([
      this.prisma.battle.findMany({
        where,
        orderBy: { finishedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.battle.count({ where }),
    ])

    const battles = records.map(record => {
      const teamACount = record.teamACount ?? 0
      const teamBCount = record.teamBCount ?? 0
      const result = this.buildResult(teamACount, teamBCount, record.totalParticipantsCount, record.winningTeam)
      const battle = this.toBattleEntity(record, record.totalParticipantsCount ?? teamACount + teamBCount)

      return ClosedBattleResponseDto.of(battle, result)
    })

    return {
      battles,
      meta: {
        offset,
        limit,
        total,
      },
    }
  }

  async getBattleResult(battleId: string): Promise<BattleResultResponseDto> {
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })
    if (!battle) {
      throw new NotFoundException(`배틀을 찾을 수 없습니다: ${battleId}`)
    }

    if (battle.status !== BATTLE_STATUS.CLOSED) {
      throw new BadRequestException('배틀이 아직 진행 중입니다.')
    }

    const playTime = this.getPlayTime(battle.playTime)
    const teamACount = battle.teamACount ?? 0
    const teamBCount = battle.teamBCount ?? 0
    const totalParticipants = battle.totalParticipantsCount ?? teamACount + teamBCount
    const timeline = this.normalizeTimeline(battle.timeline)
    const result = this.buildResult(teamACount, teamBCount, battle.totalParticipantsCount, battle.winningTeam)

    const dto = new BattleResultResponseDto()
    dto.battleId = battle.id
    dto.authorId = battle.userId
    dto.title = battle.title
    dto.description = battle.description
    dto.status = 'CLOSED'
    dto.language = battle.language
    dto.category = battle.category
    dto.playTime = playTime.time
    dto.topics = battle.topics
    dto.createdAt = battle.createdAt.toISOString()
    dto.finishedAt = battle.finishedAt ? battle.finishedAt.toISOString() : (battle.updatedAt?.toISOString() ?? battle.createdAt.toISOString())
    dto.codeA = battle.codeA
    dto.codeB = battle.codeB
    dto.result = result
    dto.metrics = {
      totalParticipants,
      totalViews: totalParticipants,
      strategiesCount: timeline.length,
      totalChats: 0,
    }
    dto.voteTimeline = [
      {
        turn: 1,
        teamAVotes: teamACount,
        teamBVotes: teamBCount,
        neutralVotes: Math.max(totalParticipants - teamACount - teamBCount, 0),
        timestamp: dto.finishedAt,
      },
    ]
    dto.timeline = timeline
    const mvpsState = this.parseMvpsState((battle as PrismaBattle & { mvpsState?: unknown }).mvpsState)
    dto.mvps = mvpsState.length > 0 ? mvpsState : this.buildLegacyMvpsFromNicknames(battle.mvps ?? [], timeline)

    return dto
  }

  async joinBattleInfo(battleId: string): Promise<BattleJoinInfoResponseDto> {
    if (!battleId) throw new BadRequestException('Battle ID가 필요합니다.')

    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } })

    if (!battle) throw new NotFoundException('존재하지 않는 배틀입니다.')

    let activeBattleState: ActiveBattleState | undefined
    let participantCount = battle.totalParticipantsCount ?? 0
    if (battle.status !== BATTLE_STATUS.CLOSED) {
      const loaded = await this.loadBattleState(battleId)
      activeBattleState = loaded.state
      participantCount = loaded.state.participants.size
    }

    const mapped = this.toBattleEntity(battle, participantCount)

    return BattleJoinInfoResponseDto.of(mapped, activeBattleState)
  }

  async joinBattle(battleJoinRequestDto: BattleJoinRequestDto, userId: string) {
    const { battleId, password, team, nickname } = battleJoinRequestDto

    if (!battleId) throw new BadRequestException('Battle ID가 필요합니다.')

    const { battle, state } = await this.loadBattleState(battleId)

    if (battle.isPrivate && battle.password) {
      const isValid = battle.password === password

      if (!isValid) throw new UnauthorizedException('잘못된 비밀번호입니다.')
    }

    if (battle.status === BATTLE_STATUS.CLOSED) throw new BadRequestException('이미 종료된 배틀입니다.')

    const existingTeam = state.participants.get(userId)

    // nickname으로 userInfoMap에 등록 (OAuth/비회원 모두)
    if (!state.userInfoMap.has(userId)) {
      state.userInfoMap.set(userId, nickname)
    }

    if (!existingTeam || existingTeam !== team) {
      this.addParticipant(state, userId, team)
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (userExists) {
      await this.prisma.battleParticipant.upsert({
        where: { userId_battleId: { userId, battleId } },
        update: { team, isMvp: false },
        create: { userId, battleId, team, isMvp: false },
      })
    }

    await this.saveBattleState(battleId, state)

    return { battleState: state, team }
  }

  async leaveBattle(userId: string, battleId: string): Promise<BattleLeaveResponseDto> {
    if (!userId || !battleId) throw new BadRequestException('유효하지 않은 요청입니다.')

    const { state: battleState } = await this.loadBattleState(battleId)
    battleState.teamA.users = battleState.teamA.users.filter(id => id !== userId)
    battleState.teamB.users = battleState.teamB.users.filter(id => id !== userId)

    // battleState.guestInfoMap.delete(userId)
    battleState.teamVotes.delete(userId)
    battleState.participants.delete(userId)

    await this.saveBattleState(battleId, battleState)

    return BattleLeaveResponseDto.of(battleState)
  }

  private calculateMVPs(state: ActiveBattleState, winner: 'A' | 'B' | 'DRAW'): Mvp[] {
    // 모든 의견 수집 (opinionHistory에 저장된 전체 의견)
    // teamA/teamB는 resetDiscussions에서 초기화되므로 opinionHistory 사용
    const allOpinions: BattleDiscussion[] = state.opinionHistory

    if (allOpinions.length === 0) return []

    // 사용자별 MVP 후보 데이터 집계
    const candidateMap = new Map<string, Mvp>()

    allOpinions.forEach(opinion => {
      const { authorId, nickname } = opinion.author

      // 빈 userId(placeholder) 제외
      if (!authorId) return

      // 의견 제출 시점에 중립 팀이면 점수 집계 제외 (중립은 의견 제출 불가)
      if (opinion.team === BATTLE_TEAM.NONE) return

      // 페이즈별로 기록된 투표 참가자 수 사용 (없으면 0으로 처리)
      const voterCount = opinion.voterCountAtPhase ?? 0
      const opinionScore = calculateOpinionScore(opinion.upvotes, voterCount)

      const existing = candidateMap.get(authorId)
      if (existing) {
        existing.score += opinionScore
        existing.totalVotes += opinion.upvotes
        existing.opinionCount += 1
        if (opinion.status === 'SELECTED') {
          existing.selectedOpinionCount += 1
        }
      } else {
        const joinedAt = this.getParticipantJoinedAt(state, authorId)
        candidateMap.set(
          authorId,
          createMvpCandidate({
            userId: authorId,
            nickname,
            team: 'A', // 임시값, 최종 팀으로 나중에 덮어씀
            score: opinionScore,
            totalVotes: opinion.upvotes,
            opinionCount: 1,
            selectedOpinionCount: opinion.status === 'SELECTED' ? 1 : 0,
            joinedAt,
          }),
        )
      }
    })

    // 최종 팀 기준으로 MVP 팀 설정 (팀 변경 반영)
    candidateMap.forEach((candidate, userId) => {
      const finalTeam = state.participants.get(userId)
      candidate.team = finalTeam === BATTLE_TEAM.A ? 'A' : finalTeam === BATTLE_TEAM.B ? 'B' : 'NONE'
    })

    if (candidateMap.size === 0) return []

    // 승리 팀 보너스 적용 (1.5배)
    candidateMap.forEach(candidate => {
      candidate.score = applyWinnerBonus(candidate.score, candidate.team, winner)
    })

    // 후보자 정렬 및 상위 MVP_DISPLAY_COUNT명 반환
    const candidates = [...candidateMap.values()]
    candidates.sort((a, b) => compareMvpCandidates(a, b, winner))

    return candidates.slice(0, MVP_DISPLAY_COUNT)
  }

  private getParticipantJoinedAt(state: ActiveBattleState, userId: string): number {
    // participants Map의 삽입 순서를 기반으로 참가 순서 반환
    const participantOrder = [...state.participants.keys()].indexOf(userId)
    return participantOrder >= 0 ? participantOrder : 0
  }

  async startBattle(battleId: string) {
    const { battleState } = await this.getBattleState(battleId)

    const startedAt = Date.now()
    const expiredAt = startedAt + BATTLE_PHASE.PENDING.time

    battleState.startedAt = startedAt
    battleState.expiredAt = expiredAt
    await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        status: BATTLE_STATUS.OPEN,
        updatedAt: new Date(),
      },
    })
    await this.saveBattleState(battleId, battleState)

    const phaseRes = BattlePhaseResponseDto.of({
      battleId,
      phase: battleState.phase,
      phaseCount: battleState.phaseCount,
      startedAt,
      expiredAt,
    })

    const roundRes = BattleRoundResponseDto.of({
      battleId,
      round: 1,
      topic: battleState.topics[0],
    })

    this.emit('battle:phase:updated', phaseRes)
    this.emit('battle:round:updated', roundRes)
    void this.scheduleNextTick(battleId)
  }

  getBattleRoomId(battleId: string, team?: BattleTeam): string {
    return team ? `battle:${battleId}:${team}` : `battle:${battleId}`
  }

  async appendChatMessage(dto: BattleChatDto, userId: string) {
    const { battleId, scope, team, text } = dto
    if (!battleId || !scope) throw new BadRequestException('잘못된 요청입니다.')
    if (!text.trim()) throw new BadRequestException('메시지가 비어 있습니다.')

    const { battleState } = await this.getBattleState(battleId)

    const nickname = this.getNicknameByUserId(battleState, userId) || ''

    const chat = {
      messageId: this.generateId(),
      team,
      sender: {
        userId,
        nickname,
      },
      text: text.trim(),
      createdAt: new Date(),
    }

    if (scope === BATTLE_CHAT_SCOPE.ALL) {
      battleState.all.chats.push(chat)
      await this.saveBattleState(battleId, battleState)
      return { battleId, scope, ...chat }
    }

    if (!team) throw new BadRequestException('진영 채팅은 team 값이 필요합니다.')

    if (team !== BATTLE_TEAM.A && team !== BATTLE_TEAM.B) {
      throw new BadRequestException('진영 채팅은 A/B 진영만 사용할 수 있습니다.')
    }

    const target = team === BATTLE_TEAM.A ? battleState.teamA : battleState.teamB
    target.chats.push(chat)

    await this.saveBattleState(battleId, battleState)
    return { battleId, scope, ...chat }
  }

  private addParticipant(battleState: ActiveBattleState, userId: string, team: string): void {
    if (!userId || !team) throw new BadRequestException('잘못된 요청입니다.')

    battleState.participants.set(userId, team as BattleTeam)
    this.rebuildTeamUsers(battleState)

    const counts = {
      teamA: battleState.teamA.users.length,
      teamB: battleState.teamB.users.length,
      teamNone: battleState.participants.size - (battleState.teamA.users.length + battleState.teamB.users.length),
    }

    this.emit('battle:user:updated', BattleUserUpdateResponseDto.of(battleState.battleId, counts))
  }

  private shuffleTopics(topics: string[], playTime: BattlePlayTimeName): string[] {
    const rounds = BATTLE_PLAYTIME[playTime]?.rounds
    if (!rounds) throw new BadRequestException('올바르지 않은 배틀 진행 시간입니다.')
    if (topics.length !== rounds) throw new BadRequestException('대주제의 개수가 라운드 수와 일치하지 않습니다.')

    const shuffled = [...topics]
    if (topics.length === 1) return shuffled

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))

      const temp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = temp
    }

    return shuffled
  }

  private rebuildTeamUsers(state: ActiveBattleState) {
    state.teamA.users = []
    state.teamB.users = []

    for (const [userId, team] of state.participants.entries()) {
      if (team === BATTLE_TEAM.A) state.teamA.users.push(userId)
      if (team === BATTLE_TEAM.B) state.teamB.users.push(userId)
    }
  }

  async voteTeam(dto: BattleTeamVoteDto, userId: string) {
    const { battleState: state } = await this.getBattleState(dto.battleId)

    if (state.phase !== BATTLE_PHASE.TEAM_SWITCH.name) {
      throw new BadRequestException('팀 변경 투표는 TEAM_SWITCH 페이즈에서만 가능합니다.')
    }

    if (!state.participants.has(userId)) {
      throw new BadRequestException('배틀 참가자만 팀 변경 투표를 할 수 있습니다.')
    }

    state.teamVotes.set(userId, dto.team)
    await this.saveBattleState(dto.battleId, state)
  }

  private async updatePhase(battleId: string): Promise<void> {
    const { battleState: state } = await this.getBattleState(battleId)

    const prevPhase = state.phase
    const prevRound = state.round

    const now = Date.now()

    const nextPhase = this.getNextPhase(state)
    if (!nextPhase) return

    state.phase = nextPhase.name
    state.startedAt = now
    state.expiredAt = now + nextPhase.time

    if (prevRound !== state.round) {
      const res = BattleRoundResponseDto.of({
        battleId,
        round: state.round,
        topic: state.topics[state.round - 1],
      })

      this.emit('battle:round:updated', res)
    }

    if (prevPhase !== state.phase) {
      const res = BattlePhaseResponseDto.of({
        battleId,
        phase: state.phase,
        phaseCount: state.phaseCount,
        startedAt: state.startedAt,
        expiredAt: state.expiredAt,
      })

      this.emit('battle:phase:updated', res)
    }

    await this.saveBattleState(battleId, state)
    void this.scheduleNextTick(battleId)
  }

  private getNextPhase(state: ActiveBattleState): BattlePhase | null {
    switch (state.phase) {
      case BATTLE_PHASE.PENDING.name:
        return BATTLE_PHASE.OPINION_SHARE
      case BATTLE_PHASE.OPINION_SHARE.name:
        state.expiredAt = Date.now() + BATTLE_PHASE.ATTACK.time
        return BATTLE_PHASE.ATTACK

      case BATTLE_PHASE.ATTACK.name:
        this.emitAttackedResult(state)
        this.resetDiscussions(state)

        return BATTLE_PHASE.DEFENSE

      case BATTLE_PHASE.DEFENSE.name:
        this.emitDefensedResult(state)
        this.resetDiscussions(state)

        state.phaseCount++

        if (state.phaseCount <= BATTLE_MAX_PHASE_COUNT) {
          return BATTLE_PHASE.ATTACK
        }

        state.phaseCount = 1

        return BATTLE_PHASE.TEAM_SWITCH

      case BATTLE_PHASE.TEAM_SWITCH.name: {
        this.applyTeamVotes(state)
        const isNextRound = this.updateRound(state)

        return isNextRound ? BATTLE_PHASE.OPINION_SHARE : null
      }

      default:
        return null
    }
  }

  private applyTeamVotes(state: ActiveBattleState) {
    const changes: Array<{ userId: string; from: BattleTeam; to: BattleTeam }> = []

    // 변경 전 인원 수 저장
    const beforeCounts = {
      teamA: state.teamA.users.length,
      teamB: state.teamB.users.length,
      teamNone: [...state.participants.values()].filter(t => t === BATTLE_TEAM.NONE).length,
    }

    for (const [userId, desiredTeam] of state.teamVotes.entries()) {
      const currentTeam = state.participants.get(userId)
      if (!currentTeam) continue
      if (currentTeam === desiredTeam) continue

      state.participants.set(userId, desiredTeam)
      changes.push({ userId, from: currentTeam, to: desiredTeam })
    }

    state.teamVotes.clear()
    this.rebuildTeamUsers(state)

    //변경 후 인원 수
    const afterCounts = {
      teamA: state.teamA.users.length,
      teamB: state.teamB.users.length,
      teamNone: state.participants.size - (state.teamA.users.length + state.teamB.users.length),
    }

    if (changes.length) {
      this.emit('battle:team:updated', BattleTeamUpdateAllResponseDto.of(state.battleId, state.round, beforeCounts, afterCounts, changes))
    }
  }

  private updateRound(state: ActiveBattleState): boolean {
    const nextRound = state.round + 1
    const maxRounds = state.totalRounds

    if (maxRounds < nextRound) {
      void this.finishBattle(state)
      return false
    }

    state.round = nextRound
    return true
  }

  private async finishBattle(state: ActiveBattleState) {
    const battleId = state.battleId
    const battleTimer = this.battleTimers.get(battleId)
    clearTimeout(battleTimer)
    this.battleTimers.delete(battleId)

    const finishedAt = new Date()
    const totalParticipants = state.participants.size
    const teamACount = state.teamA.users.length
    const teamBCount = state.teamB.users.length
    const winningTeam = teamACount === teamBCount ? 'DRAW' : teamACount > teamBCount ? 'A' : 'B'
    const timeline = this.buildTimeline(state)
    const calculatedMvps = this.calculateMVPs(state, winningTeam)

    await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        status: BATTLE_STATUS.CLOSED,
        finishedAt,
        teamACount,
        teamBCount,
        totalParticipantsCount: totalParticipants,
        winningTeam,
        timeline: timeline as unknown as Prisma.InputJsonValue,
        mvps: calculatedMvps.map(mvp => mvp.nickname),
        mvpsState: calculatedMvps as unknown as Prisma.InputJsonValue,
        updatedAt: finishedAt,
        currentRound: null,
        currentPhase: null,
        phaseCount: null,
        startedAt: null,
        expiredAt: null,
        participantsState: Prisma.DbNull,
        teamVotesState: Prisma.DbNull,
        userInfoState: Prisma.DbNull,
        attacksState: Prisma.DbNull,
        defensesState: Prisma.DbNull,
        opinionHistoryState: Prisma.DbNull,
        chatsAllState: Prisma.DbNull,
        chatsTeamAState: Prisma.DbNull,
        chatsTeamBState: Prisma.DbNull,
      },
    })

    this.emit('battle:closed', BattleClosedResponseDto.of({ battleId }))
  }

  private buildTimeline(state: ActiveBattleState): TimelineItem[] {
    const toTimelineItem = (discussion: BattleDiscussion, index: number, type: 'ATTACK' | 'DEFENSE'): TimelineItem => {
      const createdAt = new Date(discussion.selectedAt ?? Date.now()).toISOString()
      return {
        id: discussion.discussionId,
        type,
        author: {
          id: discussion.author.authorId,
          nickname: discussion.author.nickname,
        },
        team: discussion.team === BATTLE_TEAM.A ? 'A' : discussion.team === BATTLE_TEAM.B ? 'B' : 'A',
        content: discussion.content,
        turn: Math.floor(index / 2) + 1,
        upvotes: discussion.upvotes,
        createdAt,
      }
    }

    const attacks = state.all.attacks
      .filter((discussion): discussion is BattleDiscussion => discussion !== null)
      .map((discussion, index) => toTimelineItem(discussion, index, 'ATTACK'))
    const defenses = state.all.defenses
      .filter((discussion): discussion is BattleDiscussion => discussion !== null)
      .map((discussion, index) => toTimelineItem(discussion, index, 'DEFENSE'))

    return [...attacks, ...defenses].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  async getBattleState(battleId: string): Promise<{ battle: PrismaBattle; battleState: ActiveBattleState }> {
    const { battle, state } = await this.loadBattleState(battleId)
    if (battle.status === BATTLE_STATUS.CLOSED) throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')
    return { battle, battleState: state }
  }

  // Guest 등록
  async registerGuest(battleId: string, guest: GuestAccount): Promise<void> {
    const { battleState } = await this.getBattleState(battleId)
    battleState.userInfoMap.set(guest.id, guest.nickname)
    battleState.participants.set(guest.id, BATTLE_TEAM.NONE)
    this.rebuildTeamUsers(battleState)
    await this.saveBattleState(battleId, battleState)
  }

  // userId로 닉네임 조회
  private getNicknameByUserId(state: ActiveBattleState, userId: string): string | null {
    return state.userInfoMap.get(userId) || null
  }

  async generateGuestNickname(battleId: string, isTaken: (nickname: string) => boolean | Promise<boolean>): Promise<string> {
    const maxAttempts = 50
    let attempts = 0

    while (attempts < maxAttempts) {
      const nickname = generateNickname()

      // 배틀 방 내 닉네임 체크 + 외부에서 전달받은 중복 체크 함수 실행
      if (!(await this.isNicknameDuplicate(battleId, nickname)) && !(await isTaken(nickname))) {
        return nickname
      }
      attempts++
    }

    // 최대 시도 횟수 초과 시 숫자 추가하여 강제로 고유하게 만들기
    return `게스트${Date.now() % 10000}`
  }

  // 배틀 방 내 닉네임 중복 체크
  async isNicknameDuplicate(battleId: string, nickname: string): Promise<boolean> {
    const { battleState } = await this.getBattleState(battleId)
    return Array.from(battleState.userInfoMap.values()).some(existingNickname => existingNickname === nickname)
  }

  async handleAttack(battleId: string, data: { authorId: string; content: string; team: BattleTeam }): Promise<BattleDiscussion> {
    const { authorId, content, team } = data

    const { battleState } = await this.getBattleState(battleId)

    if (!this.canUserSubmitAttack(battleState, team)) {
      throw new BadRequestException('현재 공격을 등록할 수 없는 단계입니다.')
    }

    const nickname = this.getNicknameByUserId(battleState, authorId) || ''

    const attack: BattleDiscussion = {
      discussionId: this.generateId(),
      author: {
        authorId,
        nickname,
      },
      type: BATTLE_DISCUSSION_TYPE.ATTACK,
      content: content.trim(),
      upvotes: 0,
      votes: [],
      status: 'PENDING',
      team,
    }

    battleState.opinionHistory.push(attack)
    if (team === BATTLE_TEAM.A) {
      battleState.teamA.attacks.push(attack)
    } else {
      battleState.teamB.attacks.push(attack)
    }

    await this.saveBattleState(battleId, battleState)
    return attack
  }

  async handleDefense(battleId: string, data: { authorId: string; content: string; team: BattleTeam }): Promise<BattleDefense> {
    const { authorId, content, team } = data

    const { battleState } = await this.getBattleState(battleId)

    if (!this.canUserSubmitDefense(battleState, team)) {
      throw new BadRequestException('현재 반론을 등록할 수 없는 단계입니다.')
    }

    const nickname = this.getNicknameByUserId(battleState, authorId) || ''

    const defense: BattleDefense = {
      discussionId: this.generateId(),
      author: {
        authorId,
        nickname,
      },
      type: BATTLE_DISCUSSION_TYPE.DEFENSE,
      content: content.trim(),
      upvotes: 0,
      votes: [],
      status: 'PENDING',
      team,
    }

    battleState.opinionHistory.push(defense)
    if (team === BATTLE_TEAM.A) {
      battleState.teamA.defenses.push(defense)
    } else {
      battleState.teamB.defenses.push(defense)
    }

    await this.saveBattleState(battleId, battleState)
    return defense
  }

  private canUserSubmitAttack(battleState: ActiveBattleState, userTeam: BattleTeam): boolean {
    const { phase } = battleState

    if (userTeam === BATTLE_TEAM.NONE) return false

    // OPINION_SHARE 단계에서는 모든 팀이 의견 제출 가능
    if (phase === BATTLE_PHASE.OPINION_SHARE.name || phase === BATTLE_PHASE.ATTACK.name) {
      return true
    }

    return false
  }

  private canUserSubmitDefense(battleState: ActiveBattleState, userTeam: BattleTeam): boolean {
    const { phase } = battleState

    if (userTeam === BATTLE_TEAM.NONE) return false

    if (phase === BATTLE_PHASE.DEFENSE.name) {
      return true
    }

    return false
  }

  async handleAttackVote(battleId: string, discussionId: string, data: { userId: string; team: BattleTeam }): Promise<DiscussionVoteResponseDto[]> {
    //Todo: 턴 관리 pr 머지 후 턴 고려
    const { userId, team } = data

    if (team === BATTLE_TEAM.NONE) {
      throw new ForbiddenException('중립 진영은 투표할 수 없습니다.')
    }
    const { battleState } = await this.getBattleState(battleId)

    if (!this.canUserVoteAttack(battleState)) {
      throw new BadRequestException('현재 투표할 수 있는 공격 턴이 아닙니다.')
    }

    const discussions = team === BATTLE_TEAM.A ? battleState.teamA.attacks : battleState.teamB.attacks

    const idx = discussions.findIndex(d => d?.discussionId === discussionId)
    if (idx === -1) {
      throw new NotFoundException('해당 진영의 이의제기 항목이 없습니다.')
    }

    const target = discussions[idx]
    if (!target) throw new NotFoundException('해당 항목이 존재하지 않습니다.')

    if (this.hasAlreadyVoted(target.votes, userId)) {
      throw new BadRequestException('이미 투표한 항목입니다.')
    }

    const updatedDiscussions: DiscussionVoteResponseDto[] = []

    // 다른 항목에 투표한 기록이 있으면 취소
    discussions.forEach((discussion, i) => {
      if (i !== idx && discussion && this.hasAlreadyVoted(discussion.votes, userId)) {
        const canceled = this.removeVote(discussion, userId)
        discussions[i] = canceled
        this.syncOpinionHistory(battleState, discussion.discussionId, canceled)
        updatedDiscussions.push(DiscussionVoteResponseDto.of(battleId, canceled))
      }
    })

    // 새 항목에 투표 적용
    const updated = this.applyVote(target, userId)
    discussions[idx] = updated
    this.syncOpinionHistory(battleState, discussionId, updated)
    updatedDiscussions.push(DiscussionVoteResponseDto.of(battleId, updated))

    await this.saveBattleState(battleId, battleState)
    return updatedDiscussions
  }

  async handleDefenseVote(battleId: string, discussionId: string, data: { userId: string; team: BattleTeam }): Promise<DiscussionVoteResponseDto[]> {
    const { userId, team } = data

    if (team === BATTLE_TEAM.NONE) {
      throw new ForbiddenException('중립 진영은 투표할 수 없습니다.')
    }

    const { battleState } = await this.getBattleState(battleId)
    if (!this.canUserVoteDefense(battleState)) {
      throw new BadRequestException('현재 투표할 수 있는 반론 턴이 아닙니다.')
    }

    const discussions = team === BATTLE_TEAM.A ? battleState.teamA.defenses : battleState.teamB.defenses

    const idx = discussions.findIndex(d => d?.discussionId === discussionId)
    if (idx === -1) {
      throw new NotFoundException('해당 진영의 이의제기 항목이 없습니다.')
    }

    const target = discussions[idx]
    if (!target) throw new NotFoundException('해당 항목이 존재하지 않습니다.')

    if (this.hasAlreadyVoted(target.votes, userId)) {
      throw new BadRequestException('이미 투표한 항목입니다.')
    }

    const updatedDiscussions: DiscussionVoteResponseDto[] = []

    // 다른 항목에 투표한 기록이 있으면 취소
    discussions.forEach((discussion, i) => {
      if (i !== idx && discussion && this.hasAlreadyVoted(discussion.votes, userId)) {
        const canceled = this.removeVote(discussion, userId)
        discussions[i] = canceled
        this.syncOpinionHistory(battleState, discussion.discussionId, canceled)
        updatedDiscussions.push(DiscussionVoteResponseDto.of(battleId, canceled))
      }
    })

    // 새 항목에 투표 적용
    const updated = this.applyVote(target, userId)
    discussions[idx] = updated
    this.syncOpinionHistory(battleState, discussionId, updated)
    updatedDiscussions.push(DiscussionVoteResponseDto.of(battleId, updated))

    await this.saveBattleState(battleId, battleState)
    return updatedDiscussions
  }

  //turn 끝나면 최고 득표한 이의제기 항목 선정 후 이벤트 발행
  //battle:defensed
  //battle:attacked

  private canUserVoteAttack(battleState: ActiveBattleState): boolean {
    return battleState.phase === BATTLE_PHASE.ATTACK.name ? true : false
  }

  private canUserVoteDefense(battleState: ActiveBattleState): boolean {
    return battleState.phase === BATTLE_PHASE.DEFENSE.name ? true : false
  }

  private getTopOpinion = (opinions: (BattleDiscussion | null)[]): BattleDiscussion | null => {
    const filteredOpinion = opinions.filter((opinion): opinion is BattleDiscussion => opinion !== null)

    // 의견이 없으면 null 반환
    if (filteredOpinion.length === 0) return null

    // 최고 득표 찾기
    const top = filteredOpinion.reduce((top, cur) => (cur.upvotes > top.upvotes ? cur : top))

    // 최고 득표가 0이면 null 반환 (아무도 투표하지 않음)
    if (top.upvotes === 0) return null

    // 선정된 의견의 status를 SELECTED로 변경
    top.status = 'SELECTED'
    top.selectedAt = Date.now()

    return top
  }

  private pickTopVotedAttack(state: ActiveBattleState): BattleTopOpinions {
    return {
      aTeam: this.getTopOpinion(state.teamA.attacks),
      bTeam: this.getTopOpinion(state.teamB.attacks),
    }
  }

  private pickTopVotedDefense(state: ActiveBattleState): BattleTopOpinions {
    return {
      aTeam: this.getTopOpinion(state.teamA.defenses),
      bTeam: this.getTopOpinion(state.teamB.defenses),
    }
  }

  private createNullPlaceholder(team: 'A' | 'B', type: 'ATTACK' | 'DEFENSE'): BattleDiscussion {
    const now = Date.now()
    const placeholder: BattleDiscussion = {
      discussionId: `null-${team}-${type}-${now}`,
      author: {
        authorId: '',
        nickname: '',
      },
      content: '투표로 선정된 의견이 없습니다',
      upvotes: 0,
      votes: [],
      status: 'SELECTED',
      type: type,
      team: team,
      selectedAt: now,
    }
    return placeholder
  }

  private emitAttackedResult(battleState: ActiveBattleState) {
    // 페이즈 종료 시 각 팀의 투표 참가자 수 계산 및 의견에 기록
    this.recordVoterCountAtPhase(battleState.teamA.attacks, BATTLE_TEAM.A)
    this.recordVoterCountAtPhase(battleState.teamB.attacks, BATTLE_TEAM.B)

    const top = this.pickTopVotedAttack(battleState)

    const { aTeam, bTeam } = top
    const aEntry = aTeam ? aTeam : this.createNullPlaceholder('A', 'ATTACK')
    const bEntry = bTeam ? bTeam : this.createNullPlaceholder('B', 'ATTACK')
    battleState.all.attacks.push(aEntry)
    battleState.all.attacks.push(bEntry)

    this.emit('battle:attacked', DiscussionVoteResultDto.attacked(battleState.battleId, top))
  }

  private emitDefensedResult(battleState: ActiveBattleState) {
    // 페이즈 종료 시 각 팀의 투표 참가자 수 계산 및 의견에 기록
    this.recordVoterCountAtPhase(battleState.teamA.defenses, BATTLE_TEAM.A)
    this.recordVoterCountAtPhase(battleState.teamB.defenses, BATTLE_TEAM.B)

    const top = this.pickTopVotedDefense(battleState)

    const { aTeam, bTeam } = top
    const aEntry = aTeam ? aTeam : this.createNullPlaceholder('A', 'DEFENSE')
    const bEntry = bTeam ? bTeam : this.createNullPlaceholder('B', 'DEFENSE')
    battleState.all.defenses.push(aEntry)
    battleState.all.defenses.push(bEntry)

    this.emit('battle:defensed', DiscussionVoteResultDto.defensed(battleState.battleId, top))
  }

  private recordVoterCountAtPhase(opinions: (BattleDiscussion | null)[], team: BattleTeam): void {
    // 해당 팀의 이번 페이즈 투표 참가자 수 계산
    const allVoters = new Set<string>()
    opinions.forEach(o => {
      if (o && o.team === team) {
        o.votes.forEach(v => allVoters.add(v))
      }
    })
    const voterCount = allVoters.size

    // 각 의견에 투표 참가자 수 기록
    opinions.forEach(o => {
      if (o && o.team === team) {
        o.voterCountAtPhase = voterCount
      }
    })
  }

  private hasAlreadyVoted(votes: readonly string[], userId: string): boolean {
    return votes.includes(userId)
  }

  private applyVote<T extends { votes: string[]; upvotes: number }>(discussion: T, userId: string): T {
    return {
      ...discussion,
      votes: [...discussion.votes, userId],
      upvotes: discussion.upvotes + 1,
    }
  }

  private removeVote<T extends { votes: string[]; upvotes: number }>(discussion: T, userId: string): T {
    return {
      ...discussion,
      votes: discussion.votes.filter(id => id !== userId),
      upvotes: discussion.upvotes - 1,
    }
  }

  private syncOpinionHistory(battleState: ActiveBattleState, discussionId: string, updated: BattleDiscussion): void {
    const idx = battleState.opinionHistory.findIndex(o => o.discussionId === discussionId)
    if (idx !== -1) {
      battleState.opinionHistory[idx] = updated
    }
  }

  private resetDiscussions(battleState: ActiveBattleState) {
    battleState.teamA.attacks = []
    battleState.teamB.attacks = []
    battleState.teamA.defenses = []
    battleState.teamB.defenses = []
  }

  private async scheduleNextTick(battleId: string) {
    try {
      const { battleState: state } = await this.getBattleState(battleId)
      if (!state.expiredAt) return

      const prevTimer = this.battleTimers.get(battleId)
      if (prevTimer) clearTimeout(prevTimer)

      const remaining = Math.max(state.expiredAt - Date.now(), 0)

      const battleTimer = setTimeout(() => {
        void this.updatePhase(battleId)
      }, remaining)

      this.battleTimers.set(battleId, battleTimer)
    } catch {
      // ignore if battle not found or closed
    }
  }
}
