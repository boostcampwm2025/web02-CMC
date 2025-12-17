import { Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsNumber, IsString, Min, ValidateIf } from 'class-validator'
import type { BattleLanguage, BattleCategory, BattlePlayTime, BattleType } from '../types/battles.types'

export class BattleCreateQueryDto {
  @IsString()
  @IsNotEmpty()
  authorId!: string

  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsNotEmpty()
  description!: string

  @IsString()
  @IsNotEmpty()
  aCode!: string

  @IsString()
  @IsNotEmpty()
  bCode!: string

  @IsString()
  @IsNotEmpty()
  language!: BattleLanguage

  @IsString()
  @IsIn(['PUBLIC', 'PRIVATE'])
  @IsNotEmpty()
  type!: BattleType

  @IsString()
  @IsNotEmpty()
  category!: BattleCategory

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  playTime!: BattlePlayTime

  @ValidateIf((o: BattleCreateQueryDto) => o.type === 'PRIVATE')
  @IsString()
  @IsNotEmpty()
  password?: string
}
