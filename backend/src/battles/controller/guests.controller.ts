import { Controller, Post, HttpCode, Param } from '@nestjs/common'
import { GuestService } from '../service/guest.service'
import { OauthService } from '../../oauth/service/oauth.service'
import type { GuestAccount } from '../types/auth.types'

@Controller('auth')
export class GuestController {
  constructor(
    private readonly guestService: GuestService,
    private readonly oauthService: OauthService,
  ) {}

  @Post('guest/:battleId')
  @HttpCode(200)
  async createGuest(@Param('battleId') battleId: string): Promise<GuestAccount> {
    return this.guestService.handleGuest(battleId, nickname => this.oauthService.isNicknameExists(nickname))
  }
}
