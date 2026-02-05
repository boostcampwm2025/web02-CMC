import { Body, Controller, Post, Get, Query, Param, HttpCode, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { BattleResultResponseDto } from '../../dto/battleResult.dto'
import { BattleCreateQueryDto } from '../../dto/battleCreateQuery.dto'
import { BattleJoinInfoResponseDto } from '../../dto/battleJoinResponse.dto'
import { BattleListRequestQueryDto } from '../../dto/battleListRequestQuery.dto'

import { InviteAccessGuard } from '../../guards/inviteAccess.guard'

import { BATTLE_TYPE } from '../../domains/models/const/battles.const'

import { BattleCreationUseCase } from '../../application/usecases/battleCreation.usecase'
import { BattleQueryUseCase } from '../../application/usecases/battleQuery.usecase'

@Controller('battles')
export class BattlesController {
  constructor(
    private readonly creationUseCase: BattleCreationUseCase,
    private readonly queryUseCase: BattleQueryUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async createBattle(@Body() body: BattleCreateQueryDto, @Res() res: Response): Promise<void> {
    const battle = await this.creationUseCase.create(body)

    if (battle.type === BATTLE_TYPE.PRIVATE) {
      this.setInviteAccessCookie(battle.id, res)
    }

    res.json({
      battleId: battle.id,
      inviteCode: battle.inviteCode ?? null,
    })
  }

  @Get('open')
  async getOpenBattles(@Query() query: BattleListRequestQueryDto) {
    return this.queryUseCase.getOpenBattles(query.limit, query.offset)
  }

  @Get('closed')
  async getClosedBattles(@Query() query: BattleListRequestQueryDto) {
    return this.queryUseCase.getClosedBattles(query.limit, query.offset)
  }

  @Get(':inviteCode')
  @HttpCode(303)
  async getBattleByInviteCode(@Param('inviteCode') inviteCode: string, @Res() res: Response) {
    const { battleId } = await this.queryUseCase.getBattleByInviteCode(inviteCode)

    // 초대 코드로 접근했음을 쿠키에 기록
    this.setInviteAccessCookie(battleId, res)

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    return res.redirect(303, `${frontendUrl}/battle/${battleId}/team-select`)
  }

  @Post(':id/join')
  @HttpCode(200)
  @UseGuards(InviteAccessGuard)
  async joinBattleInfo(@Param('id') battleId: string): Promise<BattleJoinInfoResponseDto> {
    return this.queryUseCase.getJoinBattleInfo(battleId)
  }

  @Get(':id/result')
  @HttpCode(200)
  async getBattleResult(@Param('id') battleId: string): Promise<BattleResultResponseDto> {
    return this.queryUseCase.getBattleResult(battleId)
  }

  private setInviteAccessCookie(battleId: string, res: Response) {
    const isSecure = this.configService.get<string>('NODE_ENV') === 'production'
    res.cookie(`inviteAccess_${battleId}`, 'true', {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1시간
    })
  }
}
