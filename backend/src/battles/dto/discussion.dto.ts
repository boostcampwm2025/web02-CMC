import { IsString, IsNotEmpty, IsEnum } from 'class-validator'
import { BATTLE_TEAM } from '../const/battles.const'
import type { BattleTeam } from '@cmc/types'

export class AttackRequestDto {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}

export class DefenseRequestDto {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}

export class AttackVoteRequestDto {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsNotEmpty()
  discussionId!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}

export class DefenseVoteRequestDto {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsNotEmpty()
  discussionId!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}
