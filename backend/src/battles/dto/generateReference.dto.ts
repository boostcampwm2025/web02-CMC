import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import type { BattleLanguage, BattleCategory } from '../domains/models/types/battle.types'
import type { BattleReferenceData } from '../domains/models/types/ai.types'

export class GenerateReferenceRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsNotEmpty()
  description!: string

  @IsString()
  @IsNotEmpty()
  codeA!: string

  @IsString()
  @IsNotEmpty()
  codeB!: string

  @IsString()
  @IsNotEmpty()
  language!: BattleLanguage

  @IsString()
  @IsNotEmpty()
  category!: BattleCategory

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  topics?: string[]
}

export class GenerateReferenceResponseDto {
  commonConcepts!: BattleReferenceData['commonConcepts']
  teamA!: BattleReferenceData['teamA']
  teamB!: BattleReferenceData['teamB']

  static of(data: BattleReferenceData): GenerateReferenceResponseDto {
    const dto = new GenerateReferenceResponseDto()
    dto.commonConcepts = data.commonConcepts
    dto.teamA = data.teamA
    dto.teamB = data.teamB
    return dto
  }
}
