import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from './redis.const'
@Injectable()
export class RedisRepository implements OnModuleDestroy {
  private readonly logger = new Logger(RedisRepository.name)

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {
    this.bindEvents()
  }

  private bindEvents() {
    this.redisClient.on('connect', () => {
      this.logger.log('🚀 Redis connection established')
    })

    this.redisClient.on('ready', () => {
      this.logger.log('✅ Redis client ready to use')
    })

    this.redisClient.on('error', err => {
      this.logger.error(`❌ Redis Error: ${err.message}`, err.stack)
    })

    this.redisClient.on('close', () => {
      this.logger.warn('⚠️ Redis connection closed')
    })
  }

  async onModuleDestroy() {
    await this.redisClient.quit()
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key)
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.redisClient.setex(key, ttl, value)
    }
    return this.redisClient.set(key, value)
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key)
  }

  async incr(key: string, ttl?: number): Promise<number> {
    if (ttl) {
      const pipeline = this.redisClient.pipeline()
      pipeline.incr(key)
      pipeline.expire(key, ttl, 'NX')
      const results = await pipeline.exec()
      return Number(results?.[0][1] ?? 0)
    }
    return this.redisClient.incr(key)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key)
    return result === 1
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redisClient.hset(key, field, value)
  }

  async hmset(key: string, data: Record<string, string>): Promise<'OK'> {
    return this.redisClient.hmset(key, data)
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.redisClient.hget(key, field)
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redisClient.hgetall(key)
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.redisClient.lpush(key, ...values)
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redisClient.lrange(key, start, stop)
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern)
  }

  // Redis Sorted Set 메서드
  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.redisClient.zadd(key, score, member)
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.zrem(key, ...members)
  }

  async zrangebyscore(key: string, min: number | string, max: number | string): Promise<string[]> {
    return this.redisClient.zrangebyscore(key, min, max)
  }

  async zscore(key: string, member: string): Promise<string | null> {
    return this.redisClient.zscore(key, member)
  }

  //set연산
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.sadd(key, ...members)
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.srem(key, ...members)
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redisClient.sismember(key, member)
    return result === 1
  }

  async scard(key: string): Promise<number> {
    return this.redisClient.scard(key)
  }

  async smembers(key: string): Promise<string[]> {
    return this.redisClient.smembers(key)
  }

  //배치 연산
  async mset(entries: [string, string][]): Promise<'OK'> {
    if (entries.length === 0) {
      return 'OK'
    }
    const pipeline = this.redisClient.pipeline()
    for (const [key, value] of entries) {
      pipeline.set(key, value)
    }
    await pipeline.exec()
    return 'OK'
  }

  async mdel(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0
    return this.redisClient.del(...keys)
  }

  //lua script 연산
  async eval(script: string, keys: string[], args: string[]): Promise<unknown> {
    return this.redisClient.eval(script, keys.length, ...keys, ...args)
  }

  //ioredis pipeline 연산
  pipeline() {
    return this.redisClient.pipeline()
  }

  getRedisClient(): Redis {
    return this.redisClient
  }
}
