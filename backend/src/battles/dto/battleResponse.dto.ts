import { Battle, BattleStatus, BattleCategory, BattleLanguage } from '../domains/models/types/battle.types'

export class BattleResponseDto {
  id: string
  title: string
  description: string
  language: BattleLanguage
  category: BattleCategory
  status: BattleStatus
  createdAt: Date
  expiresAt: Date
  clientCount: number

  static fromEntity(battle: Battle): BattleResponseDto {
    const res = new BattleResponseDto()
    const expiresAt = new Date(battle.createdAt.getTime() + battle.playTime.time * 60 * 1000)

    res.id = battle.id
    res.title = battle.title
    res.description = battle.description
    res.language = battle.language

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
