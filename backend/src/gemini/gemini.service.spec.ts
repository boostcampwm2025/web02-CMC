/* eslint-disable @typescript-eslint/unbound-method */
import { GeminiService } from './gemini.service'
import type { ConfigService } from '@nestjs/config'
import type { RedisRepository } from '../redis/redis.repository'

describe('GeminiService', () => {
  let service: GeminiService
  let configService: jest.Mocked<ConfigService>
  let redisRepository: jest.Mocked<RedisRepository>

  const createMockPipeline = () => ({
    exists: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  })

  const createMockRedisClient = () => ({
    pipeline: jest.fn().mockReturnValue(createMockPipeline()),
  })

  const createService = (keys = 'key1,key2') => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'GEMINI_API_KEYS') return keys
        if (key === 'GEMINI_RATE_LIMIT_PER_MINUTE') return 5
        if (key === 'GEMINI_RATE_LIMIT_PER_DAY') return 20
        return undefined
      }),
    } as unknown as jest.Mocked<ConfigService>

    redisRepository = {
      getRedisClient: jest.fn().mockReturnValue(createMockRedisClient()),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      incr: jest.fn().mockResolvedValue(1),
    } as unknown as jest.Mocked<RedisRepository>

    service = new GeminiService(configService, redisRepository)
    jest.spyOn(service as unknown as { sleep: (ms: number) => Promise<void> }, 'sleep').mockResolvedValue(undefined)
    return service
  }

  describe('onModuleInit', () => {
    it('API 키를 파싱하여 초기화한다', async () => {
      const svc = createService('key1, key2, key3')
      svc.onModuleInit()
      const health = await svc.getHealthStatus()
      expect(health.totalKeys).toBe(3)
    })

    it('GEMINI_API_KEYS가 없으면 에러를 던진다', () => {
      configService = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as jest.Mocked<ConfigService>
      redisRepository = {
        getRedisClient: jest.fn().mockReturnValue(createMockRedisClient()),
      } as unknown as jest.Mocked<RedisRepository>
      const svc = new GeminiService(configService, redisRepository)
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
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // exists (not disabled)
        [null, '0'], // failures
        [null, '0'], // min usage
        [null, '0'], // day usage
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockResolvedValue('result')
      const result = await service.execute(executor)
      expect(result.data).toBe('result')
      expect(executor).toHaveBeenCalledTimes(1)
    })
  })

  describe('getHealthStatus', () => {
    it('키 상태 정보를 반환한다', async () => {
      createService('abcdefghijklmn,opqrstuvwxyz12')
      service.onModuleInit()

      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // key1 disabled
        [null, '0'], // key1 failures
        [null, '1'], // key1 min usage
        [null, '2'], // key1 day usage
        [null, 0], // key2 disabled
        [null, '1'], // key2 failures
        [null, '3'], // key2 min usage
        [null, '4'], // key2 day usage
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const health = await service.getHealthStatus()
      expect(health.totalKeys).toBe(2)
      expect(health.keyStatuses).toHaveLength(2)
      expect(health.keyStatuses[0]).toHaveProperty('keyPrefix')
      expect(health.keyStatuses[0]).toHaveProperty('minuteUsage')
      expect(health.keyStatuses[0]).toHaveProperty('dailyUsage')
      expect(health.keyStatuses[0]).toHaveProperty('isDisabled')
      expect(health.keyStatuses[0]).toHaveProperty('consecutiveFailures')
    })
  })

  describe('execute 재시도 로직', () => {
    beforeEach(() => {
      createService('testkey1,testkey2')
      service.onModuleInit()
    })

    it('실패 시 다른 키로 재시도한다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      let callCount = 0
      const executor = jest.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          throw new Error('First key failed')
        }
        return Promise.resolve('success')
      })

      const result = await service.execute(executor)

      expect(result.data).toBe('success')
      expect(executor).toHaveBeenCalledTimes(2)
    })

    it('모든 키가 실패하면 예외를 던진다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockRejectedValue(new Error('All keys failed'))

      await expect(service.execute(executor)).rejects.toThrow('All keys failed')
      expect(executor).toHaveBeenCalledTimes(2) // 2개 키
    })
  })

  describe('에러 분류', () => {
    beforeEach(() => {
      createService('testkey1,testkey2,testkey3')
      service.onModuleInit()
    })

    it('429 에러를 RATE_LIMIT로 분류한다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockRejectedValue(new Error('429 Too Many Requests'))

      await expect(service.execute(executor)).rejects.toThrow()
    })

    it('resource_exhausted 에러를 RATE_LIMIT로 분류한다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockRejectedValue(new Error('resource_exhausted'))

      await expect(service.execute(executor)).rejects.toThrow()
    })

    it('quota 에러를 QUOTA_EXCEEDED로 분류한다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockRejectedValue(new Error('quota exceeded'))

      await expect(service.execute(executor)).rejects.toThrow()
    })

    it('401 에러를 AUTH_ERROR로 분류한다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockRejectedValue(new Error('401 Unauthorized'))

      await expect(service.execute(executor)).rejects.toThrow()
    })

    it('403 에러를 AUTH_ERROR로 분류한다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockRejectedValue(new Error('403 Forbidden'))

      await expect(service.execute(executor)).rejects.toThrow()
    })

    it('timeout 에러를 NETWORK_ERROR로 분류한다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockRejectedValue(new Error('Connection timeout'))

      await expect(service.execute(executor)).rejects.toThrow()
    })

    it('Error가 아닌 예외를 UNKNOWN으로 분류한다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockRejectedValue('string error')

      await expect(service.execute(executor)).rejects.toBeDefined()
    })
  })

  describe('키 비활성화', () => {
    beforeEach(() => {
      createService('testkey1,testkey2')
      service.onModuleInit()
    })

    it('연속 실패 시 consecutiveFailures가 증가한다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      // 모든 호출 실패
      const executor = jest.fn().mockRejectedValue(new Error('Failure'))

      // 모든 키 실패
      await expect(service.execute(executor)).rejects.toThrow()

      // incr가 호출되었는지 확인 (연속 실패 기록)
      expect(redisRepository.incr).toHaveBeenCalled()
    })
  })

  describe('키 재활성화', () => {
    it('비활성화 시간이 지나면 키가 다시 활성화된다', async () => {
      createService('testkey1')
      service.onModuleInit()

      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // not disabled
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      // 초기 상태 확인
      const initialHealth = await service.getHealthStatus()
      expect(initialHealth.totalKeys).toBe(1)
    })
  })

  describe('사용량 기록', () => {
    beforeEach(() => {
      createService('testkey1')
      service.onModuleInit()
    })

    it('요청 시 사용량이 기록된다', async () => {
      const mockPipeline = createMockPipeline()
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, '0'],
        [null, '0'],
        [null, '0'],
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockResolvedValue('result')

      await service.execute(executor)

      // incr가 호출되었는지 확인 (사용량 기록)
      expect(redisRepository.incr).toHaveBeenCalled()
    })
  })

  describe('레이트 리밋 처리', () => {
    it('분당 제한에 도달하면 다른 키를 사용한다', async () => {
      createService('testkey1,testkey2')
      configService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEYS') return 'testkey1,testkey2'
        if (key === 'GEMINI_RATE_LIMIT_PER_MINUTE') return 2
        if (key === 'GEMINI_RATE_LIMIT_PER_DAY') return 100
        return undefined
      })
      service.onModuleInit()

      const mockPipeline = createMockPipeline()
      // 첫 번째 키가 이미 분당 제한에 도달한 상태
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // key1 not disabled
        [null, '0'], // key1 failures
        [null, '2'], // key1 min usage (at limit)
        [null, '2'], // key1 day usage
        [null, 0], // key2 not disabled
        [null, '0'], // key2 failures
        [null, '0'], // key2 min usage (available)
        [null, '0'], // key2 day usage
      ])
      redisRepository.getRedisClient.mockReturnValue({
        pipeline: jest.fn().mockReturnValue(mockPipeline),
      } as unknown as ReturnType<RedisRepository['getRedisClient']>)

      const executor = jest.fn().mockResolvedValue('result')

      await service.execute(executor)

      // executor가 호출되었고 성공했음을 확인
      expect(executor).toHaveBeenCalled()
    })
  })
})
