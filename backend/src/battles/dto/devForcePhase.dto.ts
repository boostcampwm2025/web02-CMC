import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import type { BattlePhaseName } from '@cmc/types'

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
