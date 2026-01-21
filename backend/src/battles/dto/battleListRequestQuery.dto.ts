import { Type } from 'class-transformer'
import { IsInt, Min } from 'class-validator'
import type { BattleListRequest } from '@cmc/types'

export class BattleListRequestQueryDto implements BattleListRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 10

  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0
}
