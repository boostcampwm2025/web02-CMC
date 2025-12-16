import { Injectable } from '@nestjs/common'
import { v7 as uuidv7 } from 'uuid'
import { BATTLE_PHASE, BATTLE_STATUS } from '../const/battles.const'
import type { BattleCreateQueryDto } from '../dto/battle-create-query.dto'
import { Battle, BattleStatus } from '../types/battles.types'
import { MOCK_BATTLES } from '../mock/battles.mock'
import { BattleResponseDto } from '../dto/battle-response.dto'

@Injectable()
export class BattlesService {
  private readonly battles: Battle[] = []

  private generateId(): string {
    return uuidv7()
  }

  create(payload: BattleCreateQueryDto): Battle {
    const now = new Date()
    const status: BattleStatus = BATTLE_STATUS.PENDING

    const battle: Battle = {
      id: this.generateId(),
      authorId: payload.authorId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      aCode: payload.aCode,
      bCode: payload.bCode,
      language: payload.language.trim(),
      type: payload.type,
      category: payload.category.trim(),
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

  getOpenBattles(limit: number, offset: number): BattleResponseDto[] {
    const battles = this.battles.filter(battle => this.isPublicAndOpen(battle)).slice(offset, offset + limit) // TODO: ORM 적용 시 take/skip
    return BattleResponseDto.of(battles)
  }

  getClosedBattles(limit: number, offset: number): BattleResponseDto[] {
    const battles = this.battles.filter(battle => this.isPublicAndClosed(battle)).slice(offset, offset + limit)
    return BattleResponseDto.of(battles)
  }

  private isPublicAndOpen(battle: Battle): boolean {
    return battle.isPublic && battle.status === BATTLE_STATUS.OPEN
  }

  private isPublicAndClosed(battle: Battle): boolean {
    return battle.isPublic && battle.status === BATTLE_STATUS.CLOSED
  }
}
