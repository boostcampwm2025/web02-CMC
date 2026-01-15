import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import type { BattleTeam } from '../types/battles.types'

export class BattleJoinRequestDto {
  @IsString()
  @IsNotEmpty()
  battleId: string

  @IsString()
  @IsNotEmpty()
  team: BattleTeam

  @IsString()
  @IsOptional()
  password?: string
}
