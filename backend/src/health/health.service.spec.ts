import { Logger, ServiceUnavailableException } from '@nestjs/common'
import type { PrismaService } from '../prisma/prisma.service'
import type { RedisHealthRepository } from '../redis/redis-health.repository'
import { HealthService } from './health.service'

describe('HealthService', () => {
  let prismaService: { ping: jest.Mock<Promise<void>, []> }
  let redisRepository: { ping: jest.Mock<Promise<void>, []> }
  let healthService: HealthService

  beforeEach(() => {
    prismaService = { ping: jest.fn().mockResolvedValue(undefined) }
    redisRepository = { ping: jest.fn().mockResolvedValue(undefined) }
    healthService = new HealthService(prismaService as unknown as PrismaService, redisRepository as unknown as RedisHealthRepository)
    jest.spyOn(Logger.prototype, 'warn').mockImplementation()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('getLiveness', () => {
    it('외부 의존성을 조회하지 않고 프로세스 상태를 반환한다', () => {
      expect(healthService.getLiveness()).toEqual({ status: 'alive' })
      expect(prismaService.ping).not.toHaveBeenCalled()
      expect(redisRepository.ping).not.toHaveBeenCalled()
    })
  })

  describe('getReadiness', () => {
    it('데이터베이스와 Redis가 응답하면 ready를 반환한다', async () => {
      await expect(healthService.getReadiness()).resolves.toEqual({ status: 'ready' })
      expect(prismaService.ping).toHaveBeenCalledTimes(1)
      expect(redisRepository.ping).toHaveBeenCalledTimes(1)
    })

    it('데이터베이스가 응답하지 않으면 503 예외를 던진다', async () => {
      prismaService.ping.mockRejectedValueOnce(new Error('database unavailable'))

      await expect(healthService.getReadiness()).rejects.toBeInstanceOf(ServiceUnavailableException)
    })

    it('Redis가 응답하지 않으면 503 예외를 던진다', async () => {
      redisRepository.ping.mockRejectedValueOnce(new Error('redis unavailable'))

      await expect(healthService.getReadiness()).rejects.toBeInstanceOf(ServiceUnavailableException)
    })

    it('의존성 확인이 제한 시간 안에 끝나지 않으면 503 예외를 던진다', async () => {
      jest.useFakeTimers()
      prismaService.ping.mockReturnValueOnce(new Promise(() => undefined))

      const readiness = expect(healthService.getReadiness()).rejects.toBeInstanceOf(ServiceUnavailableException)
      await jest.advanceTimersByTimeAsync(2000)

      await readiness
    })
  })
})
