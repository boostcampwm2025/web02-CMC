import { v7 as uuidv7 } from 'uuid'
import { EventEmitter } from 'node:events'
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common'

import { MOCK_BATTLES } from '../mock/battles.mock'
import { TimelineItem, Mvp, BattleResult, VoteTimeline, Metrics } from '../types/battleResult.types'
import {
  ActiveBattleState,
  Battle,
  BattlePhase,
  BattleTeam,
  BattleDiscussion,
  BattleDefense,
  BattlePlayTime,
  BattleTopOpinions,
  BattlePlayTimeName,
  FinishedBattleState,
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
} from '../const/battles.const'
import { BattlePhaseResponseDto, BattleRoundResponseDto } from '../dto/battleTurnResponse.dto'
import { DiscussionVoteResponseDto } from '../dto/discussionVoteResponse.dto'
import { DiscussionVoteResultDto } from '../dto/discussionVoteResult.dto'
import { BattleClosedResponseDto } from '../dto/battleClosedResponse.dto'
import { BattleTeamUpdateAllResponseDto } from '../dto/battleTeamUpdateAllResponse.dto'
import { BattleUserUpdateResponseDto } from '../dto/battleUserUpdateResponse.dto'
import { GuestAccount } from '../types/auth.types'

@Injectable()
export class BattlesService extends EventEmitter {
  private battles: Battle[] = [...MOCK_BATTLES]
  private activeBattles: Map<string, ActiveBattleState> = new Map()
  private battleTimers: Map<string, NodeJS.Timeout> = new Map()
  private finishedBattles: Map<string, FinishedBattleState> = new Map()

  constructor() {
    super()
    this.battles.forEach(battle => {
      if (battle.status === 'OPEN') {
        this.initBattleState(battle.id)
      }
    })
  }

  private generateId(): string {
    return uuidv7()
  }

  create(payload: BattleCreateQueryDto): Battle {
    const now = new Date()
    const battleId = this.generateId()
    const playTime: BattlePlayTime = BATTLE_PLAYTIME[payload.playTime]
    const shuffledTopics = this.shuffleTopics(payload.topics, payload.playTime)

    const battle: Battle = {
      id: battleId,
      authorId: payload.authorId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      aCode: payload.aCode,
      bCode: payload.bCode,
      language: payload.language,
      type: payload.type,
      category: payload.category,
      playTime,
      topics: shuffledTopics,
      password: payload.type === BATTLE_TYPE.PRIVATE ? undefined : payload.password?.trim(),
      status: BATTLE_STATUS.PENDING,
      createdAt: now,
      updatedAt: now,
      participantCount: 1,
      initialState: {
        round: 1,
        phase: BATTLE_PHASE.OPINION_SHARE.name,
        timeRemainingSeconds: playTime.time * 60,
      },
    }

    this.battles.push(battle)
    this.initBattleState(battle.id)

    return battle
  }

  //Todo: 정렬 기준 재설정
  //실시간 배틀 목록 조회
  getOpenBattles(limit: number, offset: number) {
    const filtered = this.battles.filter(battle => this.isPublicAndWaitingOrOpen(battle))
    const battles = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(offset, offset + limit) // TODO: ORM 적용 시 take/skip

    return {
      battles: BattleResponseDto.of(battles),
      meta: {
        offset,
        limit,
        total: filtered.length,
      },
    }
  }

  //지난 배틀 조회
  getClosedBattles(limit: number, offset: number) {
    // const filtered = this.battles.filter(battle => this.isPublicAndClosed(battle))
    // const battles = filtered
    //   .sort((a, b) => b.createdAt.getTime() - a.expiresAt.getTime() )
    //   .slice(offset, offset + limit)

    const battles = Array.from(this.finishedBattles.values())
      .sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())
      .slice(offset, offset + limit)
      .map(mock => ClosedBattleResponseDto.fromFinished(mock))

    return {
      battles,
      meta: {
        offset,
        limit,
        total: battles.length,
      },
    }
  }

  getBattleResult(battleId: string): BattleResultResponseDto {
    // 1. 목데이터에서 배틀 조회
    const battle = this.finishedBattles.get(battleId)
    if (!battle) {
      const activeOrPending = this.battles.find(candidate => candidate.id === battleId)
      if (activeOrPending && activeOrPending.status !== BATTLE_STATUS.CLOSED) {
        throw new BadRequestException('배틀이 아직 진행 중입니다.')
      }
      throw new NotFoundException(`배틀을 찾을 수 없습니다: ${battleId}`)
    }

    // 2. 배틀 상태 검증
    if (battle.status !== BATTLE_STATUS.CLOSED) {
      throw new BadRequestException('배틀이 아직 진행 중입니다.')
    }

    // 3. MVP 재계산 (검증용)
    const mvp = this.calculateMVP(battle.timeline)

    return BattleResultResponseDto.fromEntity(battle, mvp)
  }

  joinBattleInfo(battleId: string): BattleJoinInfoResponseDto {
    if (!battleId) throw new BadRequestException('Battle ID가 필요합니다.')

    const battle = this.battles.find(battle => battle.id === battleId)

    if (!battle) throw new NotFoundException('존재하지 않는 배틀입니다.')

    const activeBattleState = this.activeBattles.get(battleId)

    return BattleJoinInfoResponseDto.of(battle, activeBattleState)
  }

  joinBattle(battleJoinRequestDto: BattleJoinRequestDto, userId: string) {
    const { battleId, password, team } = battleJoinRequestDto

    if (!battleId) throw new BadRequestException('Battle ID가 필요합니다.')

    const battle = this.battles.find(battle => battle.id === battleId)

    if (!battle) throw new NotFoundException('존재하지 않는 배틀입니다.')

    if (battle.type === BATTLE_TYPE.PRIVATE && battle.password) {
      const isValid = battle.password === password

      if (!isValid) throw new UnauthorizedException('잘못된 비밀번호입니다.')
    }

    if (battle.status === BATTLE_STATUS.CLOSED) throw new BadRequestException('이미 종료된 배틀입니다.')

    //  이미 참여한 userId인지 확인
    const battleState = this.getBattleState(battleId)
    if (battleState.participants.has(userId)) {
      return { battleState, team }
    }

    // Guest 등록 확인
    if (!battleState.guestInfoMap.has(userId)) {
      throw new BadRequestException('Guest 등록이 필요합니다. 먼저 닉네임을 등록해주세요.')
    }

    this.addParticipant(battleId, userId, team)

    return { battleState, team }
  }

  setBattlesForTest(battles: Battle[]) {
    this.battles = battles
  }

  private calculateMVP(timeline: TimelineItem[]): Mvp | null {
    if (timeline.length === 0) return null

    // 사용자별 누적 upvotes 집계
    const userVotes = new Map<string, { nickname: string; team: 'A' | 'B'; votes: number }>()

    timeline.forEach(item => {
      const current = userVotes.get(item.author.id) || {
        nickname: item.author.nickname,
        team: item.team,
        votes: 0,
      }
      current.votes += item.upvotes
      userVotes.set(item.author.id, current)
    })

    // 최다 득표자 (동점 시 첫 번째)
    const entries = [...userVotes.entries()].sort((a, b) => b[1].votes - a[1].votes)
    if (entries.length === 0) return null

    const [userId, data] = entries[0]

    return {
      userId,
      nickname: data.nickname,
      team: data.team,
      totalVotes: data.votes,
    }
  }

  private initBattleState(battleId: string): void {
    if (!battleId) throw new BadRequestException('잘못된 요청입니다.')
    const battle = this.battles.find(({ id }) => id == battleId)
    if (!battle) throw new NotFoundException('배틀이 존재하지 않습니다.')

    if (this.activeBattles.has(battleId)) return

    const activeBattleState: ActiveBattleState = {
      battleId,
      all: {
        roomId: this.getBattleRoomId(battleId),
        chats: [],
        attacks: [],
        defenses: [],
      },
      teamA: {
        roomId: this.getBattleRoomId(battleId, BATTLE_TEAM.A),
        users: [],
        chats: [],
        attacks: [],
        defenses: [],
      },
      teamB: {
        roomId: this.getBattleRoomId(battleId, BATTLE_TEAM.B),
        users: [],
        chats: [],
        attacks: [],
        defenses: [],
      },
      participants: new Map(),
      teamVotes: new Map(),

      guestInfoMap: new Map(),

      phase: BATTLE_PHASE.PENDING.name,
      round: 1,
      topics: [...battle.topics],
      phaseCount: 1,

      startedAt: null,
      expiredAt: null,
    }

    this.activeBattles.set(battleId, activeBattleState)
  }

  startBattle(battleId: string) {
    const battleState = this.getBattleState(battleId)
    const battle = this.battles.find(b => b.id === battleId)

    const startedAt = Date.now()
    const expiredAt = startedAt + BATTLE_PHASE.PENDING.time

    battleState.startedAt = startedAt
    battleState.expiredAt = expiredAt
    if (battle) {
      battle.status = BATTLE_STATUS.OPEN
    }

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
    this.scheduleNextTick(battleId)
  }

  getBattleRoomId(battleId: string, team?: BattleTeam): string {
    return team ? `battle:${battleId}:${team}` : `battle:${battleId}`
  }

  appendChatMessage(dto: BattleChatDto, userId: string) {
    const { battleId, scope, team, text } = dto
    if (!battleId || !scope) throw new BadRequestException('잘못된 요청입니다.')
    if (!text.trim()) throw new BadRequestException('메시지가 비어 있습니다.')

    const battleState = this.activeBattles.get(battleId)
    if (!battleState) throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')

    const nickname = this.getNicknameByUserId(battleId, userId) || ''

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
      return { battleId, scope, ...chat }
    }

    if (!team) throw new BadRequestException('진영 채팅은 team 값이 필요합니다.')

    if (team !== BATTLE_TEAM.A && team !== BATTLE_TEAM.B) {
      throw new BadRequestException('진영 채팅은 A/B 진영만 사용할 수 있습니다.')
    }

    const target = team === BATTLE_TEAM.A ? battleState.teamA : battleState.teamB
    target.chats.push(chat)

    return { battleId, scope, ...chat }
  }

  private addParticipant(battleId: string, userId: string, team: string): void {
    if (!battleId || !userId || !team) throw new BadRequestException('잘못된 요청입니다.')
    const battleState = this.activeBattles.get(battleId)

    if (!battleState) throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')

    battleState.participants.set(userId, team as BattleTeam)
    this.rebuildTeamUsers(battleState)

    const counts = {
      teamA: battleState.teamA.users.length,
      teamB: battleState.teamB.users.length,
      teamNone: battleState.participants.size - (battleState.teamA.users.length + battleState.teamB.users.length),
    }

    this.emit('battle:user:updated', BattleUserUpdateResponseDto.of(battleId, counts))
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

  voteTeam(dto: BattleTeamVoteDto, userId: string) {
    const state = this.getBattleState(dto.battleId)

    if (state.phase !== BATTLE_PHASE.TEAM_SWITCH.name) {
      throw new BadRequestException('팀 변경 투표는 TEAM_SWITCH 페이즈에서만 가능합니다.')
    }

    if (!state.participants.has(userId)) {
      throw new BadRequestException('배틀 참가자만 팀 변경 투표를 할 수 있습니다.')
    }

    state.teamVotes.set(userId, dto.team)
  }

  private updatePhase(battleId: string): void {
    const state = this.getBattleState(battleId)

    const battle = this.battles.find(battle => battle.id === battleId)
    if (!battle) return
    if (battle?.status === BATTLE_STATUS.CLOSED) return

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
        topic: battle.topics[state.round - 1],
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

    this.scheduleNextTick(battleId)
  }

  private getNextPhase(state: ActiveBattleState): BattlePhase | null {
    switch (state.phase) {
      case BATTLE_PHASE.PENDING.name:
        return BATTLE_PHASE.OPINION_SHARE
      case BATTLE_PHASE.OPINION_SHARE.name:
        state.expiredAt = Date.now() + BATTLE_PHASE.ATTACK.time
        return BATTLE_PHASE.ATTACK

      case BATTLE_PHASE.ATTACK.name:
        this.emitAttackedResult(state.battleId)
        this.resetDiscussions(state.battleId)

        return BATTLE_PHASE.DEFENSE

      case BATTLE_PHASE.DEFENSE.name:
        this.emitDefensedResult(state.battleId)
        this.resetDiscussions(state.battleId)

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
    const battle = this.battles.find(battle => battle.id === state.battleId)
    if (!battle) throw new NotFoundException('해당 배틀이 존재하지 않습니다.')

    const nextRound = state.round + 1
    const maxRounds = battle.playTime.rounds

    if (maxRounds < nextRound) {
      this.finishBattle(battle)
      return false
    }

    state.round = nextRound
    return true
  }

  private finishBattle(battle: Battle) {
    const battleTimer = this.battleTimers.get(battle.id)
    clearTimeout(battleTimer)
    this.battleTimers.delete(battle.id)

    battle.status = BATTLE_STATUS.CLOSED

    const finishedAt = new Date()
    const finishedBattle = this.battles.find(b => b.id === battle.id)
    const state = this.activeBattles.get(battle.id)

    if (finishedBattle && state) {
      const snapshot = this.buildFinishedBattleState(finishedBattle, state, finishedAt)
      this.finishedBattles.set(battle.id, snapshot)
    }

    this.activeBattles.delete(battle.id)
    this.battles = this.battles.filter(b => b.id !== battle.id)

    this.emit('battle:closed', BattleClosedResponseDto.of({ battleId: battle.id }))
  }

  private buildFinishedBattleState(battle: Battle, state: ActiveBattleState, finishedAt: Date): FinishedBattleState {
    const totalParticipants = state.participants.size
    const teamAVotes = state.teamA.users.length
    const teamBVotes = state.teamB.users.length
    const neutralVotes = Math.max(totalParticipants - teamAVotes - teamBVotes, 0)
    const totalVotes = teamAVotes + teamBVotes + neutralVotes

    const percentage = (votes: number) => (totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100))

    const result: BattleResult = {
      winner: teamAVotes === teamBVotes ? 'DRAW' : teamAVotes > teamBVotes ? 'A' : 'B',
      teamA: { votes: teamAVotes, percentage: percentage(teamAVotes) },
      teamB: { votes: teamBVotes, percentage: percentage(teamBVotes) },
      neutral: { votes: neutralVotes, percentage: percentage(neutralVotes) },
    }

    const voteTimeline: VoteTimeline[] = [
      {
        turn: 1,
        teamAVotes,
        teamBVotes,
        neutralVotes,
        timestamp: finishedAt.toISOString(),
      },
    ]

    const timeline = this.buildTimeline(state)
    const calculatedMvp = this.calculateMVP(timeline)

    const metrics: Metrics = {
      totalParticipants,
      totalViews: totalParticipants,
      strategiesCount: timeline.length,
      totalChats: state.all.chats.length + state.teamA.chats.length + state.teamB.chats.length,
    }

    return {
      battleId: battle.id,
      authorId: battle.authorId,
      title: battle.title,
      description: battle.description,
      status: BATTLE_STATUS.CLOSED,
      language: battle.language,
      category: battle.category,
      playTime: battle.playTime.time,
      topics: [...battle.topics],
      createdAt: battle.createdAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      codeA: battle.aCode,
      codeB: battle.bCode,
      result,
      metrics,
      voteTimeline,
      timeline,
      mvp:
        calculatedMvp ||
        ({
          userId: '',
          nickname: 'unknown',
          team: 'A',
          totalVotes: 0,
        } as Mvp),
    }
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

  private isPublicAndWaitingOrOpen(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && (battle.status === BATTLE_STATUS.OPEN || battle.status === BATTLE_STATUS.PENDING)
  }

  private isPublicAndClosed(battle: Battle): boolean {
    return battle.status === BATTLE_STATUS.CLOSED //임시로 public 조건 제거
    // return battle.type === BATTLE_TYPE.PUBLIC &&  battle.status === BATTLE_STATUS.CLOSED
  }

  getBattleState(battleId: string) {
    const battleState = this.activeBattles.get(battleId)
    if (!battleState) throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')

    return battleState
  }

  // Guest 등록
  registerGuest(battleId: string, guest: GuestAccount): void {
    const battleState = this.getBattleState(battleId)
    battleState.guestInfoMap.set(guest.id, guest.nickname)
  }

  // userId로 닉네임 조회
  getNicknameByUserId(battleId: string, userId: string): string | null {
    const battleState = this.activeBattles.get(battleId)
    if (!battleState) return null
    return battleState.guestInfoMap.get(userId) || null
  }

  // 배틀 방 내 닉네임 중복 체크
  isNicknameDuplicate(battleId: string, nickname: string): boolean {
    const battleState = this.activeBattles.get(battleId)
    if (!battleState) return false
    return Array.from(battleState.guestInfoMap.values()).some(existingNickname => existingNickname === nickname)
  }

  handleAttack(battleId: string, data: { authorId: string; content: string; team: BattleTeam }): BattleDiscussion {
    const { authorId, content, team } = data

    const battleState = this.getBattleState(battleId)

    if (!this.canUserSubmitAttack(battleState, team)) {
      throw new BadRequestException('현재 공격을 등록할 수 없는 단계입니다.')
    }

    const nickname = this.getNicknameByUserId(battleId, authorId) || ''

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

    // battleState.all.attacks.push(attack)
    if (team === BATTLE_TEAM.A) {
      battleState.teamA.attacks.push(attack)
    } else {
      battleState.teamB.attacks.push(attack)
    }

    return attack
  }

  handleDefense(battleId: string, data: { authorId: string; content: string; team: BattleTeam }): BattleDefense {
    const { authorId, content, team } = data

    const battleState = this.getBattleState(battleId)

    if (!this.canUserSubmitDefense(battleState, team)) {
      throw new BadRequestException('현재 반론을 등록할 수 없는 단계입니다.')
    }

    const nickname = this.getNicknameByUserId(battleId, authorId) || ''

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

    // battleState.all.defenses.push(defense)
    if (team === BATTLE_TEAM.A) {
      battleState.teamA.defenses.push(defense)
    } else {
      battleState.teamB.defenses.push(defense)
    }

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

  handleAttackVote(battleId: string, discussionId: string, data: { userId: string; team: BattleTeam }): DiscussionVoteResponseDto[] {
    //Todo: 턴 관리 pr 머지 후 턴 고려
    const { userId, team } = data

    if (team === BATTLE_TEAM.NONE) {
      throw new ForbiddenException('중립 진영은 투표할 수 없습니다.')
    }
    const battleState = this.getBattleState(battleId)

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
        updatedDiscussions.push(DiscussionVoteResponseDto.of(battleId, canceled))
      }
    })

    // 새 항목에 투표 적용
    const updated = this.applyVote(target, userId)
    discussions[idx] = updated
    updatedDiscussions.push(DiscussionVoteResponseDto.of(battleId, updated))

    return updatedDiscussions
  }

  handleDefenseVote(battleId: string, discussionId: string, data: { userId: string; team: BattleTeam }): DiscussionVoteResponseDto[] {
    const { userId, team } = data

    if (team === BATTLE_TEAM.NONE) {
      throw new ForbiddenException('중립 진영은 투표할 수 없습니다.')
    }

    const battleState = this.getBattleState(battleId)
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
        updatedDiscussions.push(DiscussionVoteResponseDto.of(battleId, canceled))
      }
    })

    // 새 항목에 투표 적용
    const updated = this.applyVote(target, userId)
    discussions[idx] = updated
    updatedDiscussions.push(DiscussionVoteResponseDto.of(battleId, updated))

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

  private pickTopVotedAttack(battleId: string): BattleTopOpinions {
    const battleState = this.getBattleState(battleId)

    return {
      aTeam: this.getTopOpinion(battleState.teamA.attacks),
      bTeam: this.getTopOpinion(battleState.teamB.attacks),
    }
  }

  private pickTopVotedDefense(battleId: string): BattleTopOpinions {
    const battleState = this.getBattleState(battleId)

    return {
      aTeam: this.getTopOpinion(battleState.teamA.defenses),
      bTeam: this.getTopOpinion(battleState.teamB.defenses),
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

  private emitAttackedResult(battleId: string) {
    const top = this.pickTopVotedAttack(battleId)

    const battleState = this.activeBattles.get(battleId)

    const { aTeam, bTeam } = top
    const aEntry = aTeam ? aTeam : this.createNullPlaceholder('A', 'ATTACK')
    const bEntry = bTeam ? bTeam : this.createNullPlaceholder('B', 'ATTACK')
    battleState?.all.attacks.push(aEntry)
    battleState?.all.attacks.push(bEntry)

    this.emit('battle:attacked', DiscussionVoteResultDto.attacked(battleId, top))
  }

  private emitDefensedResult(battleId: string) {
    const top = this.pickTopVotedDefense(battleId)

    const battleState = this.activeBattles.get(battleId)

    const { aTeam, bTeam } = top
    const aEntry = aTeam ? aTeam : this.createNullPlaceholder('A', 'DEFENSE')
    const bEntry = bTeam ? bTeam : this.createNullPlaceholder('B', 'DEFENSE')
    battleState?.all.defenses.push(aEntry)
    battleState?.all.defenses.push(bEntry)

    this.emit('battle:defensed', DiscussionVoteResultDto.defensed(battleId, top))
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

  private resetDiscussions(battleId: string) {
    const battleState = this.getBattleState(battleId)

    battleState.teamA.attacks = []
    battleState.teamB.attacks = []
    battleState.teamA.defenses = []
    battleState.teamB.defenses = []
  }

  private scheduleNextTick(battleId: string) {
    const battle = this.battles.find(battle => battle.id === battleId)
    if (battle?.status === BATTLE_STATUS.CLOSED) return

    const state = this.getBattleState(battleId)
    if (!state.expiredAt) return

    const prevTimer = this.battleTimers.get(battleId)
    if (prevTimer) clearTimeout(prevTimer)

    const remaining = Math.max(state.expiredAt - Date.now(), 0)

    const battleTimer = setTimeout(() => {
      this.updatePhase(battleId)
    }, remaining)

    this.battleTimers.set(battleId, battleTimer)
  }
}
