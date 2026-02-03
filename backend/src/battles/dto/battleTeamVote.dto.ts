import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { BATTLE_TEAM } from '../domains/models/const/battles.const'
import type { BattleTeam } from '../domains/models/types/battle.types'

export class BattleTeamVoteDto {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsIn([BATTLE_TEAM.A, BATTLE_TEAM.B, BATTLE_TEAM.NONE])
  team!: BattleTeam
}
