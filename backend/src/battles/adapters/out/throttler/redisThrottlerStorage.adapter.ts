import { ThrottlerStorage } from '@nestjs/throttler'
import type { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface'
import { RedisThrottlerStorageError } from 'src/battles/errors/redisThrottlerStorage.error'
import { RedisRepository } from 'src/redis/redis.repository'

export class RedisThrottlerStorageAdapter implements ThrottlerStorage {
  // INCR + EXP 원자적 실행
  private readonly incrementScript = `
    local current = redis.call('INCR', KEYS[1])

    if current == 1 then
      redis.call('PEXPIRE', KEYS[1], ARGV[1])
    end

    local ttl = redis.call('PTTL', KEYS[1])

    return { current, ttl }
  `

  constructor(private readonly redisRepository: RedisRepository) {}

  async increment(key: string, ttl: number, limit: number): Promise<ThrottlerStorageRecord> {
    const result = await this.executeScript(this.incrementScript, [key], [ttl.toString()])

    const [totalHits, ttlMsLeft] = this.parseResult(result)
    const normalizedTtlMs = ttlMsLeft > 0 ? ttlMsLeft : ttl
    const timeToExpire = Math.max(0, Math.ceil(normalizedTtlMs / 1000))
    const isBlocked = totalHits > limit

    return {
      totalHits,
      timeToExpire,
      isBlocked,
      timeToBlockExpire: isBlocked ? timeToExpire : 0,
    }
  }

  private async executeScript(script: string, keys: string[], args: string[]): Promise<unknown> {
    try {
      return await this.redisRepository.eval(script, keys, args)
    } catch (error) {
      throw new RedisThrottlerStorageError('Redis Throttler 스크립트 실행 중 오류가 발생했습니다.', { cause: error })
    }
  }

  private parseResult(result: unknown): [number, number] {
    if (!Array.isArray(result) || result.length !== 2) {
      throw new RedisThrottlerStorageError('Redis Throttler 스크립트 실행에 실패하였습니다.', { cause: result })
    }

    const [totalHits, ttlMsLeft] = result.map(Number)

    if (isNaN(totalHits) || isNaN(ttlMsLeft)) {
      throw new RedisThrottlerStorageError('Redis Throttler 스크립트 실행 결과가 숫자가 아닙니다.', { cause: result })
    }

    return [totalHits, ttlMsLeft]
  }
}
