import { Body, Controller, Post } from '@nestjs/common'
import { BattlesService } from '../service/battles.service'
import { BattleCreateQueryDto } from '../dto/battle-create-query.dto'

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post()
  createBattle(@Body() body: BattleCreateQueryDto): { battleId: string } {
    const battle = this.battlesService.create(body)
    return { battleId: battle.id }
  }
}
