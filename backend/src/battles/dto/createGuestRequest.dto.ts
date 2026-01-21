import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator'
import type { CreateGuestRequest } from '@cmc/types'

export class CreateGuestRequestDto implements CreateGuestRequest {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(8)
  nickname!: string
}
