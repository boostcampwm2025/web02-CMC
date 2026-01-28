import { Controller, Post, HttpCode, Param } from '@nestjs/common'
import { AuthService } from '../service/auth.service'
import { BattlesService } from '../service/battles.service'
import { OauthService } from '../../oauth/service/oauth.service'
import type { GuestAccount } from '../types/auth.types'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly battlesService: BattlesService,
    private readonly oauthService: OauthService,
  ) {}

  @Post('guest/:battleId')
  @HttpCode(200)
  async createGuest(@Param('battleId') battleId: string): Promise<GuestAccount> {
    // 배틀 존재 확인
    await this.battlesService.getBattleState(battleId)

    // Guest 닉네임 생성 (배틀 내 + OAuth 사용자 닉네임 중복 체크)
    const guestNickname = await this.battlesService.generateGuestNickname(
      battleId,
      nickname => this.oauthService.isNicknameExists(nickname),
    )
    const guest = this.authService.createGuest(guestNickname)

    // 배틀 방에 Guest 등록
    await this.battlesService.registerGuest(battleId, guest)

    return guest
  }
}
