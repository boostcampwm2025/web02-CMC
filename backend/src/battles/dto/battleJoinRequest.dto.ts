import { IsNotEmpty, IsString } from 'class-validator'
import type { BattleTeam } from '../domains/models/types/battle.types'

export class BattleJoinRequestDto {
  @IsString()
  @IsNotEmpty()
  battleId: string

  @IsString()
  @IsNotEmpty()
  team: BattleTeam

  @IsString()
  @IsNotEmpty()
  nickname: string
}
