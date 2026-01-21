import { IsString, IsNotEmpty, MaxLength } from 'class-validator'

export class UpdateNicknameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  nickname: string
}
