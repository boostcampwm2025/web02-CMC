import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BattlesModule } from './battles/battles.module'
import { ConfigModule } from '@nestjs/config'
import { OauthModule } from './oauth/oauth.module'
import { MetricsModule } from './metrics/metrics.module'
import { HttpMetricsMiddleware } from './metrics/http-metrics.middleware'
import { GeminiModule } from './gemini/gemini.module'
import { RedisModule } from './redis/redis.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { RedisRepository } from './redis/redis.repository'
import { RedisThrottlerStorageAdapter } from './battles/adapters/out/throttler/redisThrottlerStorage.adapter'
import { BATTLE_CLIENT_EVENTS } from '@cmc/types'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisRepository],
      useFactory: (redisRepository: RedisRepository) => ({
        throttlers: [
          { name: BATTLE_CLIENT_EVENTS.CHAT, ttl: 1000, limit: 5 },
          { name: BATTLE_CLIENT_EVENTS.ATTACK, ttl: 1000, limit: 1 },
          { name: BATTLE_CLIENT_EVENTS.DEFENSE, ttl: 1000, limit: 1 },
        ],
        storage: new RedisThrottlerStorageAdapter(redisRepository),
        setHeaders: false,
      }),
    }),
    RedisModule,
    GeminiModule,
    BattlesModule,
    OauthModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMetricsMiddleware).forRoutes('*')
  }
}
