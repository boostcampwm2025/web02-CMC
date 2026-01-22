import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator'

export class UpdateNicknameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(8)
  nickname: string
}
