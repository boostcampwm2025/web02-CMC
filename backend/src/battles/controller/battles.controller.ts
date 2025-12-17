import { Controller, Get, Param, HttpCode, InternalServerErrorException, HttpException } from '@nestjs/common'
import { BattlesService } from '../service/battles.service'
import { BattleResultResponseDto } from '../dto/battleResult.dto'

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
  }
}
