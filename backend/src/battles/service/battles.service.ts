import { v7 as uuidv7 } from 'uuid'
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'

import { Battle } from '../types/battles.types'
import { TimelineItem, Mvp } from '../types/battleResult.types'
import { mockBattleResults } from '../mock/battleResults.mock'
import { BattleResponseDto } from '../dto/battle-response.dto'
import { BattleResultResponseDto } from '../dto/battleResult.dto'
import type { BattleCreateQueryDto } from '../dto/battle-create-query.dto'
import { BATTLE_PHASE, BATTLE_STATUS, BATTLE_TYPE } from '../const/battles.const'

@Injectable()
export class BattlesService {
  private battles: Battle[] = []

  private generateId(): string {
    return uuidv7()
  }

  create(payload: BattleCreateQueryDto): Battle {
    const now = new Date()

    const battle: Battle = {
      id: this.generateId(),
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
        phase: BATTLE_PHASE.WAITING_FOR_START,
        timeRemainingSeconds: payload.playTime * 60,
      },
    }

    this.battles.push(battle)

    return battle
  }

  setBattlesForTest(battles: Battle[]) {
    this.battles = battles
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

  private isPublicAndOpen(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && battle.status === BATTLE_STATUS.OPEN
  }

  private isPublicAndClosed(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && battle.status === BATTLE_STATUS.CLOSED
  }

  private getExpiredTime(battle: Battle): Date {
    return new Date(battle.createdAt.getTime() + battle.playTime * 60 * 1000)
  }
}
