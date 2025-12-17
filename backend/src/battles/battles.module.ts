import { Module } from '@nestjs/common'
import { BattlesController } from './controller/battles.controller'
import { BattlesGateway } from './gateway/battles.gateway'
import { BattlesService } from './service/battles.service'

@Module({
  controllers: [BattlesController],
  providers: [BattlesGateway, BattlesService],
})
export class BattlesModule {}
