import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { BattleReferencePort, GenerateReferenceRequest } from '../../../application/ports/out/battleReference.port'
import type { BattleReferenceData } from '../../../domains/models/types/ai.types'
import { BUILD_AI_REFERENCE_PROMPT, AI_REFERENCE_SCHEMA } from '../../../domains/models/const/battles.const'

@Injectable()
export class BattleReferenceGeneratorAdapter implements BattleReferencePort {
  constructor(private readonly configService: ConfigService) {}

  async generate(dto: GenerateReferenceRequest): Promise<BattleReferenceData> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')
    if (!apiKey) {
      throw new InternalServerErrorException('AI 서비스를 사용할 수 없습니다.')
    }

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
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: AI_REFERENCE_SCHEMA,
        },
      })

      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      const referenceData = JSON.parse(text) as BattleReferenceData
      return referenceData
    } catch (error: unknown) {
      if (error instanceof InternalServerErrorException) {
        throw error
      }
      throw new InternalServerErrorException('AI 참고 자료 생성에 실패했습니다.')
    }
  }
}
