import { IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { BATTLE_CHAT_SCOPE, BATTLE_TEAM } from '../const/battles.const'
import type { BattleTeam } from '@cmc/types'

export class BattleChatDto {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsIn([BATTLE_CHAT_SCOPE.ALL, BATTLE_CHAT_SCOPE.TEAM])
  scope!: typeof BATTLE_CHAT_SCOPE.ALL | typeof BATTLE_CHAT_SCOPE.TEAM

  @IsString()
  @IsIn([BATTLE_TEAM.A, BATTLE_TEAM.B, 'NONE'])
  @IsNotEmpty()
  team: BattleTeam

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  text!: string
}
