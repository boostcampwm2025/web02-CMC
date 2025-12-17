import { IsString, IsNotEmpty, IsEnum } from 'class-validator'
import { BATTLE_TEAM } from '../const/battles.const'
import type { BattleTeam } from '../types/battles.types'

export class AttackRequestDto {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsNotEmpty()
  authorId!: string

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
  authorId!: string

  @IsString()
  @IsNotEmpty()
  attackId!: string

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

  @IsString()
  @IsNotEmpty()
  userId!: string

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

  @IsString()
  @IsNotEmpty()
  userId!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}
