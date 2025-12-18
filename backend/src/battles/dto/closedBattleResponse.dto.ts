import { Battle, BattleCategory, BattleStatus } from '../types/battles.types'
import { BattleResult } from '../types/battleResult.types'

export class ClosedBattleResponseDto {
  id: string
  title: string
  description: string
  category: BattleCategory
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
    dto.expiresAt = new Date(battle.createdAt.getTime() + battle.playTime * 60 * 1000)

    dto.result = result

    return dto
  }

  //임시
  /* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-argument
*/
  static fromMock(mock: any) {
    const dto = new ClosedBattleResponseDto()

    dto.id = mock.id
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
