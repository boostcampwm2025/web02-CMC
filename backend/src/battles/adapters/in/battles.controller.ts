import { Body, Controller, Post, Get, Query, Param, HttpCode, InternalServerErrorException, HttpException, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { BattleResultResponseDto } from '../../dto/battleResult.dto'
import { BattleCreateQueryDto } from '../../dto/battleCreateQuery.dto'
import { BattleJoinInfoResponseDto } from '../../dto/battleJoinResponse.dto'
import { BattleListRequestQueryDto } from '../../dto/battleListRequestQuery.dto'

import { InviteAccessGuard } from '../../guards/inviteAccess.guard'

import { BATTLE_TYPE } from '../../domains/models/const/battles.const'

import { BattleCreationUseCase } from '../../application/usecases/battleCreation.usecase'
import { GetOpenBattlesUseCase } from '../../application/usecases/getOpenBattles.usecase'
import { GetClosedBattlesUseCase } from '../../application/usecases/getClosedBattles.usecase'
import { GetBattleByInviteCodeUseCase } from '../../application/usecases/getBattleByInviteCode.usecase'
import { GetJoinBattleInfoUseCase } from '../../application/usecases/getJoinBattleInfo.usecase'
import { GetBattleResultUseCase } from '../../application/usecases/getBattleResult.usecase'

@Controller('battles')
export class BattlesController {
  constructor(
    private readonly creationUseCase: BattleCreationUseCase,
    private readonly getOpenBattlesUseCase: GetOpenBattlesUseCase,
    private readonly getClosedBattlesUseCase: GetClosedBattlesUseCase,
    private readonly getBattleByInviteCodeUseCase: GetBattleByInviteCodeUseCase,
    private readonly getJoinBattleInfoUseCase: GetJoinBattleInfoUseCase,
    private readonly getBattleResultUseCase: GetBattleResultUseCase,
  ) {}

  @Post()
  async createBattle(@Body() body: BattleCreateQueryDto, @Res() res: Response): Promise<void> {
    const battle = await this.creationUseCase.create(body)

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
    return this.getOpenBattlesUseCase.execute(query.limit, query.offset)
  }

  @Get('closed')
  async getClosedBattles(@Query() query: BattleListRequestQueryDto) {
    return this.getClosedBattlesUseCase.execute(query.limit, query.offset)
  }

  @Get(':inviteCode')
  @HttpCode(303)
  async getBattleByInviteCode(@Param('inviteCode') inviteCode: string, @Res() res: Response) {
    const { battleId } = await this.getBattleByInviteCodeUseCase.execute(inviteCode)

    // 초대 코드로 접근했음을 쿠키에 기록
    this.setInviteAccessCookie(battleId, res)

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    return res.redirect(303, `${frontendUrl}/battle/${battleId}/team-select`)
  }

  @Post(':id/join')
  @HttpCode(200)
  @UseGuards(InviteAccessGuard)
  async joinBattleInfo(@Param('id') battleId: string): Promise<BattleJoinInfoResponseDto> {
    return this.getJoinBattleInfoUseCase.execute(battleId)
  }

  @Get(':id/result')
  @HttpCode(200)
  async getBattleResult(@Param('id') battleId: string): Promise<BattleResultResponseDto> {
    try {
      return await this.getBattleResultUseCase.execute(battleId)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException('배틀 결과 조회 중 오류가 발생했습니다.')
    }
  }

  private setInviteAccessCookie(battleId: string, res: Response) {
    res.cookie(`inviteAccess_${battleId}`, 'true', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1시간
    })
  }
}
