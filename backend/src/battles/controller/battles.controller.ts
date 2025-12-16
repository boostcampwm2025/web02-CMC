import { Body, Controller, Post, Get, Query } from '@nestjs/common'
import { BattlesService } from '../service/battles.service'
import { BattleCreateQueryDto } from '../dto/battle-create-query.dto'

import { BattlesRequestQueryDto } from '../dto/battle-request-query.dto'
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
  getOpenBattles(@Query() query: BattlesRequestQueryDto): BattleResponseDto[] {
    return this.battlesService.getOpenBattles(query.limit, query.offset)
  }
}
