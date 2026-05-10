import { IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator'
import type { BattlePhaseName } from '@cmc/types'
import { BATTLE_CHAT_SCOPE } from '../domains/models/const/battles.const'

const PHASE_VALUES: BattlePhaseName[] = ['PENDING', 'OPINION_SHARE', 'ATTACK', 'DEFENSE', 'TEAM_SWITCH']

export class DevForcePhaseDto {
  @IsEnum(PHASE_VALUES)
  phase: BattlePhaseName

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMs?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  round?: number
}

export class DevForceTimerDto {
  @IsInt()
  @Min(0)
  durationMs: number
}

export class DevAddParticipantDto {
  @IsEnum(['A', 'B'])
  team: 'A' | 'B'

  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsString()
  nickname?: string
}

export class DevInjectDiscussionDto {
  @IsEnum(['attack', 'defense'])
  type: 'attack' | 'defense'

  @IsEnum(['A', 'B'])
  team: 'A' | 'B'

  @IsString()
  @IsNotEmpty()
  content: string

  @IsOptional()
  @IsString()
  authorId?: string
}

export class DevInjectVoteDto {
  @IsEnum(['attack', 'defense'])
  type: 'attack' | 'defense'

  @IsEnum(['A', 'B'])
  team: 'A' | 'B'

  @IsString()
  @IsNotEmpty()
  discussionId: string

  @IsOptional()
  @IsString()
  voterId?: string
}

export class DevChatDto {
  @IsString()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsIn([BATTLE_CHAT_SCOPE.ALL, BATTLE_CHAT_SCOPE.TEAM])
  scope: typeof BATTLE_CHAT_SCOPE.ALL | typeof BATTLE_CHAT_SCOPE.TEAM

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  text: string
}

export class DevSkipDto {
  @IsString()
  @IsNotEmpty()
  userId: string

  @IsOptional()
  skip?: boolean
}
