import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { RedisRepository } from './redis.repository'
import { RedisHealthRepository } from './redis-health.repository'
import { REDIS_CLIENT, REDIS_HEALTH_CLIENT } from './redis.const'

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          retryStrategy: times => Math.min(times * 1000, 30000),
        })
      },
    },
    {
      provide: REDIS_HEALTH_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          connectTimeout: 2000,
          commandTimeout: 2000,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 0,
          retryStrategy: times => Math.min(times * 1000, 30000),
        })
        client.on('error', () => undefined)
        return client
      },
    },
    RedisRepository,
    RedisHealthRepository,
  ],
  exports: [RedisRepository, RedisHealthRepository],
})
export class RedisModule {}
