/* eslint-disable @typescript-eslint/unbound-method */
import { InternalServerErrorException } from '@nestjs/common'
import { BattleReferenceGeneratorAdapter } from './battleReferenceGenerator.adapter'
import type { GeminiService } from '../../../../gemini/gemini.service'
import type { GenerateReferenceRequest } from '../../../application/ports/out/battleReference.port'

describe('BattleReferenceGeneratorAdapter', () => {
  let adapter: BattleReferenceGeneratorAdapter
  let geminiService: jest.Mocked<GeminiService>

  beforeEach(() => {
    geminiService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GeminiService>
    adapter = new BattleReferenceGeneratorAdapter(geminiService)
  })

  const mockRequest: GenerateReferenceRequest = {
    title: '테스트 배틀',
    description: '설명',
    codeA: 'console.log("A")',
    codeB: 'console.log("B")',
    language: 'javascript',
    category: 'clean-code',
    topics: ['가독성', '성능'],
  }

  const mockReferenceData = {
    summary: 'AI 분석 결과',
    codeAAnalysis: '코드 A 분석',
    codeBAnalysis: '코드 B 분석',
  }

  describe('generate', () => {
    it('AI 참고 자료를 정상적으로 생성한다', async () => {
      geminiService.execute.mockResolvedValue({
        data: mockReferenceData,
        rateLimit: {
          limitPerMinute: 5,
          remainingMinute: 4,
          limitPerDay: 20,
          remainingDay: 19,
        },
      })
      const result = await adapter.generate(mockRequest)
      expect(result).toEqual({
        referenceData: mockReferenceData,
        rateLimit: {
          limitPerMinute: 5,
          remainingMinute: 4,
          limitPerDay: 20,
          remainingDay: 19,
        },
      })
      expect(geminiService.execute).toHaveBeenCalledTimes(1)
    })

    it('InternalServerErrorException은 그대로 전파한다', async () => {
      const error = new InternalServerErrorException('Gemini 실패')
      geminiService.execute.mockRejectedValue(error)
      await expect(adapter.generate(mockRequest)).rejects.toThrow(InternalServerErrorException)
      await expect(adapter.generate(mockRequest)).rejects.toThrow('Gemini 실패')
    })

    it('일반 에러는 InternalServerErrorException으로 래핑한다', async () => {
      geminiService.execute.mockRejectedValue(new Error('네트워크 에러'))
      await expect(adapter.generate(mockRequest)).rejects.toThrow(InternalServerErrorException)
      await expect(adapter.generate(mockRequest)).rejects.toThrow('AI 참고 자료 생성에 실패했습니다.')
    })

    it('topics가 빈 배열이면 "없음"으로 처리된다', async () => {
      geminiService.execute.mockResolvedValue({
        data: mockReferenceData,
        rateLimit: {
          limitPerMinute: 5,
          remainingMinute: 4,
          limitPerDay: 20,
          remainingDay: 19,
        },
      })
      const requestWithEmptyTopics: GenerateReferenceRequest = { ...mockRequest, topics: [] }
      await adapter.generate(requestWithEmptyTopics)
      expect(geminiService.execute).toHaveBeenCalledTimes(1)
    })
  })
})
