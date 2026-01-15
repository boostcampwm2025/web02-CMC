import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator'

export class CreateGuestRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10)
  nickname!: string
}
