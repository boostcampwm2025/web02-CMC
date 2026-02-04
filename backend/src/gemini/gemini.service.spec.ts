import { GeminiService } from './gemini.service'
import type { ConfigService } from '@nestjs/config'

describe('GeminiService', () => {
  let service: GeminiService
  let configService: jest.Mocked<ConfigService>

  const createService = (keys = 'key1,key2') => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'GEMINI_API_KEYS') return keys
        if (key === 'GEMINI_RATE_LIMIT_PER_MINUTE') return 5
        if (key === 'GEMINI_RATE_LIMIT_PER_DAY') return 20
        return undefined
      }),
    } as unknown as jest.Mocked<ConfigService>
    service = new GeminiService(configService)
    return service
  }

  describe('onModuleInit', () => {
    it('API 키를 파싱하여 초기화한다', () => {
      const svc = createService('key1, key2, key3')
      svc.onModuleInit()
      const health = svc.getHealthStatus()
      expect(health.totalKeys).toBe(3)
      expect(health.activeKeys).toBe(3)
    })

    it('GEMINI_API_KEYS가 없으면 에러를 던진다', () => {
      configService = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as jest.Mocked<ConfigService>
      const svc = new GeminiService(configService)
      expect(() => svc.onModuleInit()).toThrow('GEMINI_API_KEYS 환경변수가 필요합니다.')
    })

    it('유효한 키가 없으면 에러를 던진다', () => {
      const svc = createService(',,,')
      configService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEYS') return ',,,'
        return undefined
      })
      expect(() => svc.onModuleInit()).toThrow('GEMINI_API_KEYS에 유효한 키가 없습니다.')
    })
  })

  describe('execute', () => {
    beforeEach(() => {
      createService('testkey1,testkey2')
      service.onModuleInit()
    })

    it('executor를 실행하고 결과를 반환한다', async () => {
      const executor = jest.fn().mockResolvedValue('result')
      const result = await service.execute(executor)
      expect(result).toBe('result')
      expect(executor).toHaveBeenCalledTimes(1)
    })
  })

  describe('getHealthStatus', () => {
    it('키 상태 정보를 반환한다', () => {
      createService('abcdefghijklmn,opqrstuvwxyz12')
      service.onModuleInit()
      const health = service.getHealthStatus()
      expect(health.totalKeys).toBe(2)
      expect(health.activeKeys).toBe(2)
      expect(health.keyStatuses).toHaveLength(2)
      expect(health.keyStatuses[0]).toHaveProperty('keyPrefix')
      expect(health.keyStatuses[0]).toHaveProperty('minuteUsage')
      expect(health.keyStatuses[0]).toHaveProperty('dailyUsage')
      expect(health.keyStatuses[0]).toHaveProperty('isDisabled')
      expect(health.keyStatuses[0]).toHaveProperty('consecutiveFailures')
    })
  })
})
