import { v7 as uuidv7 } from 'uuid'
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common'

import { mockBattleResults } from '../mock/battleResults.mock'
import { TimelineItem, Mvp } from '../types/battleResult.types'
import { ActiveBattleState, Battle, BattleTeam, BattleDiscussion, BattleDefense } from '../types/battles.types'
import { BattleResponseDto } from '../dto/battleResponse.dto'
import { BattleResultResponseDto } from '../dto/battleResult.dto'
import { BattleJoinRequestDto } from '../dto/battleJoinRequest.dto'
import type { BattleCreateQueryDto } from '../dto/battleCreateQuery.dto'
import { BattleJoinInfoResponseDto } from '../dto/battleJoinResponse.dto'
import { BATTLE_PHASE, BATTLE_STATUS, BATTLE_TEAM, BATTLE_TYPE, BATTLE_DISCUSSION_TYPE } from '../const/battles.const'

@Injectable()
export class BattlesService {
  private battles: Battle[] = []
  private activeBattles: Map<string, ActiveBattleState> = new Map()

  private generateId(): string {
    return uuidv7()
  }

  create(payload: BattleCreateQueryDto): Battle {
    const now = new Date()
    const battleId = this.generateId()

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
      playTime: payload.playTime,
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
  getOpenBattles(limit: number, offset: number): BattleResponseDto[] {
    const battles = this.battles
      .filter(battle => this.isPublicAndOpen(battle))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) //최신 순
      .slice(offset, offset + limit) // TODO: ORM 적용 시 take/skip

    return BattleResponseDto.of(battles)
  }

  //지난 배틀 조회
  getClosedBattles(limit: number, offset: number): BattleResponseDto[] {
    const battles = this.battles
      .filter(battle => this.isPublicAndClosed(battle))
      .sort((a, b) => this.getExpiredTime(b).getTime() - this.getExpiredTime(a).getTime())
      .slice(offset, offset + limit) //최신 종료 순

    return BattleResponseDto.of(battles)
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
      round: 1,
      phase: BATTLE_PHASE.OPINION_SHARE.name,
      turn: null,
      startedAt: Date.now(),
      expiredAt: Date.now() + BATTLE_PHASE.OPINION_SHARE.time,
    }

    this.activeBattles.set(battleId, activeBattleState)
  }

  private addParticipant(battleId: string, clinetId: string, team: string): void {
    if (!battleId || !clinetId || !team) throw new BadRequestException('잘못된 요청입니다.')
    const battleState = this.activeBattles.get(battleId)

    if (!battleState) throw new NotFoundException('해당 배틀은 현재 진행 중이지 않습니다.')

    const { teamA, teamB } = battleState

    const myTeam = team === BATTLE_TEAM.A ? teamA : teamB
    myTeam.users.push(clinetId)
  }

  getBattleRoomId(battleId: string, team?: BattleTeam): string {
    return team ? `battle:${battleId}:${team}` : `battle:${battleId}`
  }

  private isPublicAndOpen(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && battle.status === BATTLE_STATUS.OPEN
  }

  private isPublicAndClosed(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && battle.status === BATTLE_STATUS.CLOSED
  }

  private getExpiredTime(battle: Battle): Date {
    return new Date(battle.createdAt.getTime() + battle.playTime.time * 60 * 1000)
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
  }
}
