import { BattleCategory } from '../const/battles.const'
import { Battle, BattleStatus } from '../types/battles.types'

export class BattleResponseDto {
  id: string
  title: string
  description: string
  category: BattleCategory
  status: BattleStatus
  createdAt: Date
  expiresAt: Date
  clientCount: number

  static fromEntity(battle: Battle): BattleResponseDto {
    const res = new BattleResponseDto()
    const expiresAt = new Date(battle.createdAt.getTime() + battle.playTime * 60 * 1000)

    res.id = battle.id
    res.title = battle.title
    res.description = battle.description
    res.category = battle.category
    res.status = battle.status
    res.createdAt = battle.createdAt
    res.expiresAt = expiresAt
    res.clientCount = 0 // TODO: 웹소켓 연동 시 교체

    return res
  }

  static of(battles: Battle[]): BattleResponseDto[] {
    return battles.map(battle => BattleResponseDto.fromEntity(battle))
  }
}
