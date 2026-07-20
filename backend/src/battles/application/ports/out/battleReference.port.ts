import type { BattleReferenceData } from '../../../domains/models/types/ai.types'
import type { GeminiRateLimitInfo } from '../../../../gemini/gemini.service'

export interface GenerateReferenceRequest {
  title: string
  description: string
  codeA: string
  codeB: string
  language: string
  category: string
  topics: string[]
}

export interface BattleReferencePort {
  generate(dto: GenerateReferenceRequest): Promise<{
    referenceData: BattleReferenceData
    rateLimit: GeminiRateLimitInfo
  }>
}
