import { RedisRepository } from 'src/redis/redis.repository'
import { RedisThrottlerStorageAdapter } from './redisThrottlerStorage.adapter'
import { RedisThrottlerStorageError } from 'src/battles/errors/redisThrottlerStorage.error'

describe('RedisThrottlerStorageAdapter', () => {
  let storage: RedisThrottlerStorageAdapter
  let redisRepository: jest.Mocked<Pick<RedisRepository, 'eval'>>

  beforeEach(() => {
    redisRepository = {
      eval: jest.fn(),
    }
    storage = new RedisThrottlerStorageAdapter(redisRepository as unknown as RedisRepository)
  })

  it('Redis eval 결과를 ThrottlerStorageRecord로 변환한다', async () => {
    redisRepository.eval.mockResolvedValue([3, 4500])

    const result = await storage.increment('throttler:battle:chat:battle-1:user-1', 5000, 5, 5000, 'battle:chat')

    expect(redisRepository.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('INCR', KEYS[1])"),
      ['throttler:battle:chat:battle-1:user-1'],
      ['5000'],
    )
    expect(result).toEqual({
      totalHits: 3,
      timeToExpire: 5,
      isBlocked: false,
      timeToBlockExpire: 0,
    })
  })

  it('limit을 초과하면 blocked 상태와 남은 block 시간을 반환한다', async () => {
    redisRepository.eval.mockResolvedValue(['6', '1200'])

    const result = await storage.increment('key', 5000, 5, 5000, 'battle:chat')

    expect(result).toEqual({
      totalHits: 6,
      timeToExpire: 2,
      isBlocked: true,
      timeToBlockExpire: 2,
    })
  })

  it('Redis TTL이 비정상이면 요청 ttl을 fallback으로 사용한다', async () => {
    redisRepository.eval.mockResolvedValue([1, -1])

    const result = await storage.increment('key', 1000, 5, 1000, 'battle:chat')

    expect(result.timeToExpire).toBe(1)
    expect(result.timeToBlockExpire).toBe(0)
  })

  it('Redis eval 실패를 RedisThrottlerStorageError로 감싼다', async () => {
    redisRepository.eval.mockRejectedValue(new Error('redis down'))

    await expect(storage.increment('key', 1000, 5, 1000, 'battle:chat')).rejects.toThrow(RedisThrottlerStorageError)
  })

  it('Redis 응답 shape이 배열이 아니면 RedisThrottlerStorageError를 던진다', async () => {
    redisRepository.eval.mockResolvedValue('invalid')

    await expect(storage.increment('key', 1000, 5, 1000, 'battle:chat')).rejects.toThrow(RedisThrottlerStorageError)
  })

  it('Redis 응답 값이 숫자로 변환되지 않으면 RedisThrottlerStorageError를 던진다', async () => {
    redisRepository.eval.mockResolvedValue(['not-number', 1000])

    await expect(storage.increment('key', 1000, 5, 1000, 'battle:chat')).rejects.toThrow(RedisThrottlerStorageError)
  })
})
