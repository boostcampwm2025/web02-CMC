import { v7 as uuidv7 } from 'uuid'
import { EventEmitter } from 'node:events'
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common'

import { MOCK_BATTLES } from '../mock/battles.mock'
import { mockBattleResults } from '../mock/battleResults.mock'
import { TimelineItem, Mvp } from '../types/battleResult.types'
import { ActiveBattleState, Battle, BattlePhase, BattleTeam, BattleDiscussion, BattleDefense } from '../types/battles.types'
import { BattleChatDto } from '../dto/battleChat.dto'
import { BattleResponseDto } from '../dto/battleResponse.dto'
import { BattleResultResponseDto } from '../dto/battleResult.dto'
import { BattleJoinRequestDto } from '../dto/battleJoinRequest.dto'
import type { BattleCreateQueryDto } from '../dto/battleCreateQuery.dto'
import { ClosedBattleResponseDto } from '../dto/closedBattleResponse.dto'
import { BattleJoinInfoResponseDto } from '../dto/battleJoinResponse.dto'
import { BATTLE_CHAT_SCOPE, BATTLE_PHASE, BATTLE_PLAYTIME, BATTLE_STATUS, BATTLE_TEAM, BATTLE_TURN, BATTLE_TYPE, BATTLE_DISCUSSION_TYPE } from '../const/battles.const'
import { BattlePhaseResponseDto, BattleRoundResponseDto, BattleTurnResponseDto } from '../dto/battleTurnResponse.dto'

@Injectable()
export class BattlesService extends EventEmitter {
  private battles: Battle[] = [...MOCK_BATTLES]
  private activeBattles: Map<string, ActiveBattleState> = new Map()
  private battleTimers: Map<string, NodeJS.Timeout> = new Map()

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
    const playTime = BATTLE_PLAYTIME[payload.playTime]

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
      password: payload.type === BATTLE_TYPE.PRIVATE ? undefined : payload.password?.trim(),
      status: BATTLE_STATUS.OPEN,
      createdAt: now,
      updatedAt: now,
      participantCount: 1,
      initialState: {
        round: 1,
        phase: BATTLE_PHASE.OPINION_SHARE.name,
        timeRemainingSeconds: payload.playTime.time * 60,
      },
    }

    this.battles.push(battle)
    this.initBattleState(battleId)

    return battle
  }

  //Todo: 정렬 기준 재설정
  //실시간 배틀 목록 조회
  getOpenBattles(limit: number, offset: number) {
    const filtered = this.battles.filter(battle => this.isPublicAndOpen(battle))
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

    const battles = Object.values(mockBattleResults)
      .sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())
      .slice(offset, offset + limit)
      .map(mock => ClosedBattleResponseDto.fromMock(mock))

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
    const battle = mockBattleResults[battleId]
    if (!battle) {
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

    return BattleJoinInfoResponseDto.of(battle)
  }

  joinBattle(battleJoinRequestDto: BattleJoinRequestDto, clientId: string) {
    const { battleId, password, team } = battleJoinRequestDto

    if (!battleId) throw new BadRequestException('Battle ID가 필요합니다.')

    const battle = this.battles.find(battle => battle.id === battleId)

    if (!battle) throw new NotFoundException('존재하지 않는 배틀입니다.')

    if (battle.type === BATTLE_TYPE.PRIVATE && battle.password) {
      const isValid = battle.password === password

      if (!isValid) throw new UnauthorizedException('잘못된 비밀번호입니다.')
    }

    if (battle.status === BATTLE_STATUS.CLOSED) throw new BadRequestException('이미 종료된 배틀입니다.')

    this.addParticipant(battleId, clientId, team)

    const battleState = this.getBattleState(battleId)

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
    if (this.activeBattles.has(battleId)) return

    const startedAt = Date.now()
    const expiredAt = startedAt + BATTLE_PHASE.OPINION_SHARE.time

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
      phase: BATTLE_PHASE.OPINION_SHARE.name,
      round: 1,
      turn: null,

      startedAt,
      expiredAt,
    }

    this.activeBattles.set(battleId, activeBattleState)

    const res = BattlePhaseResponseDto.of({
      battleId,
      phase: activeBattleState.phase,
      startedAt: activeBattleState.startedAt,
      expiredAt: activeBattleState.expiredAt,
    })

    this.emit('battle:phase:update', res)
    this.scheduleNextTick(battleId)
  }

  getBattleRoomId(battleId: string, team?: BattleTeam): string {
    return team ? `battle:${battleId}:${team}` : `battle:${battleId}`
  }

  appendChatMessage(dto: BattleChatDto, senderId: string) {
    const { battleId, scope, team, text } = dto
    if (!battleId || !scope) throw new BadRequestException('잘못된 요청입니다.')
    if (!text.trim()) throw new BadRequestException('메시지가 비어 있습니다.')

    const battleState = this.activeBattles.get(battleId)
    if (!battleState) throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')

    const chat = {
      messageId: this.generateId(),
      sender: senderId,
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

    return { battleId, scope, team, ...chat }
  }

  private addParticipant(battleId: string, clientId: string, team: string): void {
    if (!battleId || !clientId || !team) throw new BadRequestException('잘못된 요청입니다.')
    const battleState = this.activeBattles.get(battleId)

    if (!battleState) throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')

    const { teamA, teamB } = battleState

    const myTeam = team === BATTLE_TEAM.A ? teamA : teamB
    myTeam.users.push(clientId)
  }

  private updatePhase(battleId: string): void {
    const state = this.getBattleState(battleId)
    const battle = this.battles.find(battle => battle.id === battleId)
    if (battle?.status === BATTLE_STATUS.CLOSED) return

    const prevPhase = state.phase
    const prevTurn = state.turn?.status ?? null
    const prevRound = state.round

    const now = Date.now()

    const nextPhase = this.getNextPhase(state)
    if (!nextPhase) return

    state.phase = nextPhase.name
    state.startedAt = now

    if (!state.turn && nextPhase.time) {
      state.expiredAt = now + nextPhase.time
    }

    if (prevPhase !== state.phase) {
      const res = BattlePhaseResponseDto.of({
        battleId,
        phase: state.phase,
        startedAt: state.startedAt,
        expiredAt: state.expiredAt,
      })
      this.emit('battle:phase:update', res)
    }

    if (
      state.turn?.status &&
      !(prevPhase === BATTLE_PHASE.OPINION_SHARE.name && nextPhase === BATTLE_PHASE.TEAM_A_ATTACK) &&
      prevTurn !== state.turn.status
    ) {
      const res = BattleTurnResponseDto.of({
        battleId,
        turn: state.turn,
        startedAt: state.startedAt,
        expiredAt: state.expiredAt,
      })

      this.emit('battle:turn:update', res)
    }

    if (prevRound !== state.round) {
      const res = BattleRoundResponseDto.of({
        battleId,
        round: state.round,
      })

      this.emit('battle:round:update', res)
    }

    this.scheduleNextTick(battleId)
  }

  private getNextPhase(state: ActiveBattleState): BattlePhase | null {
    switch (state.phase) {
      case BATTLE_PHASE.OPINION_SHARE.name:
        state.turn = {
          status: BATTLE_TURN.A_ATTACK.name,
          count: 1,
        }
        state.expiredAt = Date.now() + BATTLE_TURN.A_ATTACK.time
        return BATTLE_PHASE.TEAM_A_ATTACK

      case BATTLE_PHASE.TEAM_A_ATTACK.name:
      case BATTLE_PHASE.TEAM_B_ATTACK.name:
        return this.updateTurn(state)

      case BATTLE_PHASE.TEAM_SWITCH.name: {
        const isNextRound = this.updateRound(state)
        return isNextRound ? BATTLE_PHASE.OPINION_SHARE : null
      }

      default:
        return null
    }
  }

  private updateTurn(state: ActiveBattleState): BattlePhase {
    const now = Date.now()

    if (!state.turn) {
      state.turn = {
        status: BATTLE_TURN.A_ATTACK.name,
        count: 1,
      }
      state.expiredAt = now + BATTLE_TURN.A_ATTACK.time
      return BATTLE_PHASE.TEAM_A_ATTACK
    }

    switch (state.turn.status) {
      case BATTLE_TURN.A_ATTACK.name:
        state.turn.status = BATTLE_TURN.B_DEFENSE.name
        state.expiredAt = now + BATTLE_TURN.B_DEFENSE.time
        return BATTLE_PHASE.TEAM_A_ATTACK

      case BATTLE_TURN.B_DEFENSE.name:
        if (state.turn.count < 2) {
          state.turn.status = BATTLE_TURN.A_ATTACK.name
          state.turn.count += 1
          state.expiredAt = now + BATTLE_TURN.A_ATTACK.time
          return BATTLE_PHASE.TEAM_A_ATTACK
        } else {
          state.turn.status = BATTLE_TURN.B_ATTACK.name
          state.turn.count = 1
          state.expiredAt = now + BATTLE_TURN.B_ATTACK.time
          return BATTLE_PHASE.TEAM_B_ATTACK
        }

      case BATTLE_TURN.B_ATTACK.name:
        state.turn.status = BATTLE_TURN.A_DEFENSE.name
        state.expiredAt = now + BATTLE_TURN.A_DEFENSE.time
        return BATTLE_PHASE.TEAM_B_ATTACK

      case BATTLE_TURN.A_DEFENSE.name:
        if (state.turn.count < 2) {
          state.turn.status = BATTLE_TURN.B_ATTACK.name
          state.turn.count += 1
          state.expiredAt = now + BATTLE_TURN.B_ATTACK.time
          return BATTLE_PHASE.TEAM_B_ATTACK
        } else {
          state.turn = null
          return BATTLE_PHASE.TEAM_SWITCH
        }
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
    //TODO 배틀 종료 처리
    const battleTimer = this.battleTimers.get(battle.id)
    clearTimeout(battleTimer)
    this.battleTimers.delete(battle.id)
    battle.status = BATTLE_STATUS.CLOSED
    this.activeBattles.delete(battle.id)
  }

  private isPublicAndOpen(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && battle.status === BATTLE_STATUS.OPEN
  }

  private isPublicAndClosed(battle: Battle): boolean {
    return battle.status === BATTLE_STATUS.CLOSED //임시로 public 조건 제거
    // return battle.type === BATTLE_TYPE.PUBLIC &&  battle.status === BATTLE_STATUS.CLOSED
  }

  private getBattleState(battleId: string) {
    const battleState = this.activeBattles.get(battleId)
    if (!battleState) throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')

    return battleState
  }

  handleAttack(battleId: string, data: { authorId: string; content: string; team: BattleTeam }): BattleDiscussion {
    const { authorId, content, team } = data

    const battleState = this.getBattleState(battleId)

    if (!this.canUserSubmitAttack(battleState, team)) {
      throw new BadRequestException('현재 공격을 등록할 수 없는 단계입니다.')
    }

    const attack: BattleDiscussion = {
      discussionId: this.generateId(),
      authorId,
      type: BATTLE_DISCUSSION_TYPE.ATTACK,
      content: content.trim(),
      upvotes: 0,
      votes: [],
      status: 'PENDING',
    }

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

    const defense: BattleDefense = {
      discussionId: this.generateId(),
      authorId,
      type: BATTLE_DISCUSSION_TYPE.DEFENSE,
      content: content.trim(),
      upvotes: 0,
      votes: [],
      status: 'PENDING',
    }

    if (team === BATTLE_TEAM.A) {
      battleState.teamA.defenses.push(defense)
    } else {
      battleState.teamB.defenses.push(defense)
    }

    return defense
  }

  private canUserSubmitAttack(battleState: ActiveBattleState, userTeam: BattleTeam): boolean {
    const { phase, turn } = battleState

    if (userTeam === BATTLE_TEAM.NONE) return false

    if (phase === 'TEAM_A_ATTACK' && turn?.status === 'A_ATTACK' && userTeam === BATTLE_TEAM.A) {
      return true
    }

    if (phase === 'TEAM_B_ATTACK' && turn?.status === 'B_ATTACK' && userTeam === BATTLE_TEAM.B) {
      return true
    }

    return false
  }

  private canUserSubmitDefense(battleState: ActiveBattleState, userTeam: BattleTeam): boolean {
    const { phase, turn } = battleState

    if (userTeam === BATTLE_TEAM.NONE) return false

    if (phase === 'TEAM_A_ATTACK' && turn?.status === 'B_DEFENSE' && userTeam === BATTLE_TEAM.B) {
      return true
    }

    if (phase === 'TEAM_B_ATTACK' && turn?.status === 'A_DEFENSE' && userTeam === BATTLE_TEAM.A) {
      return true
    }

    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleAttackVote(battleId: string, discussionId: string, data: { userId: string; team: BattleTeam }): any {
    throw new Error('handleAttackVote: Not implemented yet')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDefenseVote(battleId: string, discussionId: string, data: { userId: string; team: BattleTeam }): any {
    throw new Error('handleDefenseVote: Not implemented yet')
  private scheduleNextTick(battleId: string) {
    const battle = this.battles.find(battle => battle.id === battleId)
    if (battle?.status === BATTLE_STATUS.CLOSED) return

    const state = this.getBattleState(battleId)

    const prevTimer = this.battleTimers.get(battleId)
    if (prevTimer) clearTimeout(prevTimer)

    const remaining = Math.max(state.expiredAt - Date.now(), 0)

    const battleTimer = setTimeout(() => {
      this.updatePhase(battleId)
    }, remaining)

    this.battleTimers.set(battleId, battleTimer)
  }
}
