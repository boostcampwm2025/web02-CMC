import { IsNotEmpty, IsString } from 'class-validator'
import type { BattleStartRequest } from '@cmc/types'

export class BattleStartDto implements BattleStartRequest {
  @IsString()
  @IsNotEmpty()
  battleId: string

  // @IsString()
  // @IsNotEmpty()
  // userId: string
}
