import { IsArray, IsIn, IsNotEmpty, IsString, ValidateIf } from 'class-validator'
import type { BattleLanguage, BattleCategory, BattleType, BattlePlayTimeName } from '@cmc/types'

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

  @IsString()
  @IsNotEmpty()
  playTime!: BattlePlayTimeName

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  topics: string[]

  @ValidateIf((o: BattleCreateQueryDto) => o.type === 'PRIVATE')
  @IsString()
  @IsNotEmpty()
  password?: string
}
