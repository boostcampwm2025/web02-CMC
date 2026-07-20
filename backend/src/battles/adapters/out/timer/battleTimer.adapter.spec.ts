/* eslint-disable @typescript-eslint/unbound-method */
import { Logger } from '@nestjs/common'
import { BattleTimerAdapter } from './battleTimer.adapter'
import type { RedisRepository } from '../../../../redis/redis.repository'
import type { ActiveBattleState } from '../../../domains/models/types/battle.types'

describe('BattleTimerAdapter', () => {
  let adapter: BattleTimerAdapter
  let redis: jest.Mocked<RedisRepository>
  let loggerErrorSpy: jest.SpyInstance

  beforeEach(() => {
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation()
    redis = {
      zadd: jest.fn().mockResolvedValue(undefined),
      zrem: jest.fn().mockResolvedValue(undefined),
      zrangebyscore: jest.fn().mockResolvedValue([]),
      del: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<RedisRepository>
    adapter = new BattleTimerAdapter(redis)
  })

  afterEach(() => {
    loggerErrorSpy.mockRestore()
  })

  const createState = (expiredAt: number | null): ActiveBattleState => ({ expiredAt }) as unknown as ActiveBattleState

  describe('schedule', () => {
    it('expiredAt이 null이면 Redis에 저장하지 않는다', () => {
      adapter.schedule('battle-1', createState(null))
      expect(redis.zadd).not.toHaveBeenCalled()
    })

    it('expiredAt이 있으면 Redis Sorted Set에 저장한다', () => {
      const expiredAt = Date.now() + 5000
      adapter.schedule('battle-1', createState(expiredAt))

      expect(redis.zadd).toHaveBeenCalledWith('battle:timers', expiredAt, 'battle-1')
    })

    it('Redis 저장 실패를 처리하고 기록한다', async () => {
      redis.zadd.mockRejectedValue(new Error('redis unavailable'))

      adapter.schedule('battle-1', createState(Date.now() + 5000))
      await Promise.resolve()

      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to schedule battle timer battle-1', expect.any(String))
    })
  })

  describe('cancel', () => {
    it('Redis Sorted Set에서 배틀을 제거한다', () => {
      adapter.cancel('battle-1')

      expect(redis.zrem).toHaveBeenCalledWith('battle:timers', 'battle-1')
    })

    it('Redis 제거 실패를 처리하고 기록한다', async () => {
      redis.zrem.mockRejectedValue(new Error('redis unavailable'))

      adapter.cancel('battle-1')
      await Promise.resolve()

      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to cancel battle timer battle-1', expect.any(String))
    })
  })

  describe('getExpiredBattles', () => {
    it('만료된 배틀 ID 목록을 반환한다', async () => {
      redis.zrangebyscore.mockResolvedValue(['battle-1', 'battle-2'])

      const result = await adapter.getExpiredBattles()

      expect(redis.zrangebyscore).toHaveBeenCalledWith('battle:timers', '-inf', expect.any(Number))
      expect(result).toEqual(['battle-1', 'battle-2'])
    })

    it('만료된 배틀이 없으면 빈 배열을 반환한다', async () => {
      redis.zrangebyscore.mockResolvedValue([])

      const result = await adapter.getExpiredBattles()

      expect(result).toEqual([])
    })
  })

  describe('clear', () => {
    it('Redis에서 타이머 키를 삭제한다', () => {
      adapter.clear()

      expect(redis.del).toHaveBeenCalledWith('battle:timers')
    })

    it('Redis 삭제 실패를 처리하고 기록한다', async () => {
      redis.del.mockRejectedValue(new Error('redis unavailable'))

      adapter.clear()
      await Promise.resolve()

      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to clear battle timers', expect.any(String))
    })
  })
})
