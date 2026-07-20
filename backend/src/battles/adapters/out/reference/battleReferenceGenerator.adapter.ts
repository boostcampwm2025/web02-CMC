import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { GeminiService } from '../../../../gemini/gemini.service'
import { BattleReferencePort, GenerateReferenceRequest } from '../../../application/ports/out/battleReference.port'
import type { BattleReferenceData } from '../../../domains/models/types/ai.types'
import { BUILD_AI_REFERENCE_PROMPT, AI_REFERENCE_SCHEMA } from '../../../domains/models/const/battles.const'

@Injectable()
export class BattleReferenceGeneratorAdapter implements BattleReferencePort {
  constructor(private readonly geminiService: GeminiService) {}

  async generate(dto: GenerateReferenceRequest): ReturnType<BattleReferencePort['generate']> {
    const prompt = BUILD_AI_REFERENCE_PROMPT({
      title: dto.title,
      description: dto.description,
      language: dto.language,
      category: dto.category,
      topics: dto.topics?.join(', ') || '없음',
      codeA: dto.codeA,
      codeB: dto.codeB,
    })

    try {
      const result = await this.geminiService.execute(
        async model => {
          const result = await model.generateContent(prompt)
          const response = result.response
          const text = response.text()
          return JSON.parse(text) as BattleReferenceData
        },
        'gemini-3-flash-preview',
        {
          responseMimeType: 'application/json',
          responseSchema: AI_REFERENCE_SCHEMA,
        },
      )
      return {
        referenceData: result.data,
        rateLimit: result.rateLimit,
      }
    } catch (error: unknown) {
      if (error instanceof InternalServerErrorException) {
        throw error
      }
      throw new InternalServerErrorException('AI 참고 자료 생성에 실패했습니다.')
    }
  }
}
