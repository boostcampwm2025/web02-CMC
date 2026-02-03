import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BattlesModule } from './battles/battles.module'
import { ConfigModule } from '@nestjs/config'
import { OauthModule } from './oauth/oauth.module'
import { MetricsModule } from './metrics/metrics.module'
import { HttpMetricsMiddleware } from './metrics/http-metrics.middleware'
import { GeminiModule } from './gemini/gemini.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GeminiModule, BattlesModule, OauthModule, MetricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMetricsMiddleware).forRoutes('*')
  }
}
