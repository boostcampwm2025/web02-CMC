import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { RedisRepository } from './redis.repository'
import { REDIS_CLIENT } from './redis.const'

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
          retryStrategy: times => {
            const MAX_RETRIES = 10
            const DELAY = 3000

            if (times > MAX_RETRIES) {
              return null
            }

            return DELAY
          },
        })
      },
    },
    RedisRepository,
  ],
  exports: [RedisRepository],
})
export class RedisModule {}
