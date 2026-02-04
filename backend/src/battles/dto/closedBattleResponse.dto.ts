import { Battle, BattleStatus, FinishedBattleState } from '../domains/models/types/battle.types'
import { BattleResult } from '../domains/models/types/battleResult.types'

export class ClosedBattleResponseDto {
  id: string
  title: string
  description: string
  // category: BattleCategory
  category: string
  status: BattleStatus

  createdAt: Date
  expiresAt: Date

  result: BattleResult

  static of(battle: Battle, result: BattleResult): ClosedBattleResponseDto {
    const dto = new ClosedBattleResponseDto()

    dto.id = battle.id
    dto.title = battle.title
    dto.description = battle.description
    dto.category = battle.category
    dto.status = battle.status
    dto.createdAt = battle.createdAt
    dto.expiresAt = new Date(battle.createdAt.getTime() + battle.playTime.time * 60 * 1000)

    dto.result = result

    return dto
  }

  //임시
  static fromFinished(mock: FinishedBattleState) {
    const dto = new ClosedBattleResponseDto()

    dto.id = mock.battleId
    dto.title = mock.title
    dto.description = mock.description
    dto.category = mock.category
    dto.status = 'CLOSED'
    dto.createdAt = new Date(mock.createdAt)
    dto.expiresAt = new Date(mock.finishedAt)
    dto.result = mock.result

    return dto
  }
}
