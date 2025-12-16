import { Module } from '@nestjs/common'
import { BattlesService } from './battles.service'
import { BattlesGateway } from './battles.gateway'

@Module({
  providers: [BattlesGateway, BattlesService],
})
export class BattlesModule {}
