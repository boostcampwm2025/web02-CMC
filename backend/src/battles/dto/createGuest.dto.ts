import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator'

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10)
  nickname!: string
}
