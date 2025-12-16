import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BattlesModule } from './battles/battles.module'

@Module({
  imports: [BattlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
