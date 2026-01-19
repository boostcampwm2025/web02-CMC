import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BattlesModule } from './battles/battles.module'
import { ConfigModule } from '@nestjs/config'
import { OauthModule } from './oauth/oauth.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BattlesModule, OauthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
