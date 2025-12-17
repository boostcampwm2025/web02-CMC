import { Body, Controller, Post, Get, Query, Param, HttpCode, InternalServerErrorException, HttpException } from '@nestjs/common'
import { BattlesService } from '../service/battles.service'
import { BattleCreateQueryDto } from '../dto/battle-create-query.dto'

import { BattleResultResponseDto } from '../dto/battleResult.dto'
import { BattleListRequestQueryDto } from '../dto/battle-list-request-query.dto'
import { BattleResponseDto } from '../dto/battle-response.dto'

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Get(':id/result')
  @HttpCode(200)
  getBattleResult(@Param('id') battleId: string): BattleResultResponseDto {
    try {
      return this.battlesService.getBattleResult(battleId)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException('배틀 결과 조회 중 오류가 발생했습니다.')
    }
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
