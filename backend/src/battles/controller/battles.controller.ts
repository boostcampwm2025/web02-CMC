import { Body, Controller, Post, Get, Query, Param, HttpCode, InternalServerErrorException, HttpException, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { BattlesService } from '../service/battles.service'
import { BattleResultResponseDto } from '../dto/battleResult.dto'
import { BattleCreateQueryDto } from '../dto/battleCreateQuery.dto'
import { BattleJoinInfoResponseDto } from '../dto/battleJoinResponse.dto'
import { BattleListRequestQueryDto } from '../dto/battleListRequestQuery.dto'
import { BATTLE_TYPE } from '../const/battles.const'
import { InviteAccessGuard } from '../guards/invite-access.guard'

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post()
  async createBattle(@Body() body: BattleCreateQueryDto, @Res() res: Response): Promise<void> {
    const battle = await this.battlesService.create(body)

    if (battle.type === BATTLE_TYPE.PRIVATE) {
      this.setInviteAccessCookie(battle.id, res)
    }

    res.json({
      battleId: battle.id,
      inviteCode: battle.inviteCode,
    })
  }

  @Get('open')
  async getOpenBattles(@Query() query: BattleListRequestQueryDto) {
    return this.battlesService.getOpenBattles(query.limit, query.offset)
  }

  @Get('closed')
  async getClosedBattles(@Query() query: BattleListRequestQueryDto) {
    return this.battlesService.getClosedBattles(query.limit, query.offset)
  }

  @Get(':inviteCode')
  @HttpCode(303)
  async getBattleByInviteCode(@Param('inviteCode') inviteCode: string, @Res() res: Response) {
    const { battleId } = await this.battlesService.getBattleByInviteCode(inviteCode)

    // 초대 코드로 접근했음을 쿠키에 기록
    this.setInviteAccessCookie(battleId, res)

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    return res.redirect(303, `${frontendUrl}/battle/${battleId}/team-select`)
  }

  @Post(':id/join')
  @HttpCode(200)
  @UseGuards(InviteAccessGuard)
  async joinBattleInfo(@Param('id') battleId: string): Promise<BattleJoinInfoResponseDto> {
    return this.battlesService.joinBattleInfo(battleId)
  }

  @Get(':id/result')
  @HttpCode(200)
  async getBattleResult(@Param('id') battleId: string): Promise<BattleResultResponseDto> {
    try {
      return await this.battlesService.getBattleResult(battleId)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException('배틀 결과 조회 중 오류가 발생했습니다.')
    }
  }

  private setInviteAccessCookie(battleId: string, res: Response) {
    res.cookie(`inviteAccess:${battleId}`, 'true', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1시간
    })
  }
}
