import { IsString, IsNotEmpty, IsEnum } from 'class-validator'
import { BATTLE_TEAM } from '../const/battles.const'
import type { BattleTeam } from '../types/battles.types'

export class DiscussionCreateDto {
  @IsString()
  @IsNotEmpty()
  authorId!: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}

export class DefenseCreateDto {
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

export class DiscussionVoteDto {
  @IsString()
  @IsNotEmpty()
  userId!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}
