import { Module } from '@nestjs/common'
import { BattlesController } from './controller/battles.controller'
import { AuthController } from './controller/auth.controller'
import { BattlesGateway } from './gateway/battles.gateway'
import { BattlesService } from './service/battles.service'
import { AuthService } from './service/auth.service'

@Module({
  controllers: [BattlesController, AuthController],
  providers: [BattlesGateway, BattlesService, AuthService],
  exports: [BattlesService],
})
export class BattlesModule {}
