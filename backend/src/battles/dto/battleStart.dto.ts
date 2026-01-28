import { IsNotEmpty, IsString } from 'class-validator'

export class BattleStartDto {
  @IsString()
  @IsNotEmpty()
  battleId: string

  // @IsString()
  // @IsNotEmpty()
  // userId: string
}
