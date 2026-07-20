import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_HEALTH_CLIENT } from './redis.const'

@Injectable()
export class RedisHealthRepository implements OnModuleDestroy {
  constructor(@Inject(REDIS_HEALTH_CLIENT) private readonly redisClient: Redis) {}

  async ping(): Promise<void> {
    if (this.redisClient.status !== 'ready') {
      throw new Error(`Redis health client is not ready: ${this.redisClient.status}`)
    }
    await this.redisClient.ping()
  }

  onModuleDestroy() {
    this.redisClient.disconnect(false)
  }
}
