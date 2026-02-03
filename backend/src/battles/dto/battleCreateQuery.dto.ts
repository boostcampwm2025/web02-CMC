import { IsArray, IsIn, IsNotEmpty, IsString } from 'class-validator'
import type { BattleLanguage, BattleCategory, BattleType, BattlePlayTimeName } from '../domains/models/types/battle.types'

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
}
