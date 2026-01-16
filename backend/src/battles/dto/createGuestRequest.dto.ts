import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator'

export class CreateGuestRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(8)
  nickname!: string
}
