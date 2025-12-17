import { Module } from '@nestjs/common'
import { BattlesController } from './controller/battles.controller'
import { BattlesService } from './service/battles.service'

@Module({
  controllers: [BattlesController],
  providers: [BattlesService],
})
export class BattlesModule {}
