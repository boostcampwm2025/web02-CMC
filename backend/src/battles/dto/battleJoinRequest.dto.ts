import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import type { BattleTeam, BattleJoinRequest } from '@cmc/types'

export class BattleJoinRequestDto implements BattleJoinRequest {
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
