import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BattlesModule } from './battles/battles.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [BattlesModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
