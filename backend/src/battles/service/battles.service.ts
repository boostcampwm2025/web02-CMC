import { Injectable } from '@nestjs/common'
import { v7 as uuidv7 } from 'uuid'
import { BATTLE_PHASE } from '../const/battles.const'
import type { BattleCreateQueryDto } from '../dto/battle-create-query.dto'
import { Battle, BattleStatus } from '../types/battles.types'
import { BattleResponseDto } from '../dto/battle-response.dto'
import { BATTLE_TYPE } from '../const/battles.const'

@Injectable()
export class BattlesService {
  private battles: Battle[] = []

  private generateId(): string {
    return uuidv7()
  }

  create(payload: BattleCreateQueryDto): Battle {
    const now = new Date()
    const status: BattleStatus = 'OPEN'

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
      password: payload.type === 'PUBLIC' ? undefined : payload.password?.trim(),
      status,
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

  private isPublicAndOpen(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && battle.status === 'OPEN'
  }

  private isPublicAndClosed(battle: Battle): boolean {
    return battle.type === BATTLE_TYPE.PUBLIC && battle.status === 'CLOSED'
  }

  private getExpiredTime(battle: Battle): Date {
    return new Date(battle.createdAt.getTime() + battle.playTime * 60 * 1000)
  }
}
