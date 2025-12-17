import { Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator'

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
  language!: string

  @IsString()
  @IsIn(['PUBLIC', 'PRIVATE'])
  type!: 'PUBLIC' | 'PRIVATE'

  @IsString()
  @IsNotEmpty()
  category!: string

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  playTime!: number

  @ValidateIf(o => o.type === 'PRIVATE')
  @IsString()
  @IsNotEmpty()
  password?: string
}
