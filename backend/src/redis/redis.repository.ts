import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from './redis.const'
@Injectable()
export class RedisRepository implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

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

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key)
    return result === 1
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redisClient.hset(key, field, value)
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

  getRedisClient(): Redis {
    return this.redisClient
  }
}
