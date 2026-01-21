import { IsString, IsNotEmpty, IsEnum } from 'class-validator'
import { BATTLE_TEAM } from '../const/battles.const'
import type { BattleTeam, AttackCreateRequest, DefenseCreateRequest, AttackVoteRequest, DefenseVoteRequest } from '@cmc/types'

export class AttackRequestDto implements AttackCreateRequest {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}

export class DefenseRequestDto implements DefenseCreateRequest {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}

export class AttackVoteRequestDto implements AttackVoteRequest {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsNotEmpty()
  discussionId!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}

export class DefenseVoteRequestDto implements DefenseVoteRequest {
  @IsString()
  @IsNotEmpty()
  battleId!: string

  @IsString()
  @IsNotEmpty()
  discussionId!: string

  @IsEnum(BATTLE_TEAM)
  team!: BattleTeam
}
