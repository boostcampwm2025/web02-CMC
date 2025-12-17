import { Body, Controller, Post, Get, Query } from '@nestjs/common'
import { BattlesService } from '../service/battles.service'
import { BattleCreateQueryDto } from '../dto/battle-create-query.dto'

import { BattleListRequestQueryDto } from '../dto/battle-list-request-query.dto'
import { BattleResponseDto } from '../dto/battle-response.dto'

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post()
  createBattle(@Body() body: BattleCreateQueryDto): { battleId: string } {
    const battle = this.battlesService.create(body)
    return { battleId: battle.id }
  }
  @Get('open')
  getOpenBattles(@Query() query: BattleListRequestQueryDto): BattleResponseDto[] {
    return this.battlesService.getOpenBattles(query.limit, query.offset)
  }

  @Get('closed')
  getClosedBattles(@Query() query: BattleListRequestQueryDto): BattleResponseDto[] {
    return this.battlesService.getClosedBattles(query.limit, query.offset)
  }
}
