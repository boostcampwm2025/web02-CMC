import { Controller, Post, HttpCode, Param, NotFoundException } from '@nestjs/common'
import { AuthService } from '../service/auth.service'
import { BattlesService } from '../service/battles.service'
import type { GuestAccount } from '../types/auth.types'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly battlesService: BattlesService,
  ) {}

  @Post('guest/:battleId')
  @HttpCode(200)
  createGuest(@Param('battleId') battleId: string): GuestAccount {
    // 배틀 존재 확인
    const battleState = this.battlesService.getBattleState(battleId)
    if (!battleState) {
      throw new NotFoundException('배틀을 찾을 수 없습니다.')
    }

    // Guest 생성
    const guestNickname = this.battlesService.generateGuestNickname(battleId)
    const guest = this.authService.createGuest(guestNickname)

    // 배틀 방에 Guest 등록
    this.battlesService.registerGuest(battleId, guest)

    return guest
  }
}
