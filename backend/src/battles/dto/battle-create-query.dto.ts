import { Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'
import type { BattleLanguage } from '../types/battles.types'
import type { BattleCategory, BattlePlayTime } from '../const/battles.const'

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
  type!: 'PUBLIC' | 'PRIVATE'

  @IsString()
  @IsNotEmpty()
  category!: BattleCategory

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  playTime!: BattlePlayTime

  // @ValidateIf(o => o.type === 'PRIVATE')
  @IsString()
  @IsNotEmpty()
  password?: string
}
