import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { BATTLE_TEAM } from '../const/battles.const'
import type { BattleTeam, BattleTeamVoteRequest } from '@cmc/types'

export class BattleTeamVoteDto implements BattleTeamVoteRequest {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsIn([BATTLE_TEAM.A, BATTLE_TEAM.B, BATTLE_TEAM.NONE])
  team!: BattleTeam
}
