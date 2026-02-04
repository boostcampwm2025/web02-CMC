import { Injectable } from '@nestjs/common'
import { OauthService } from '../../../../oauth/service/oauth.service'
import { GuestCheckPort } from '../../../application/ports/out/guestCheck.port'

@Injectable()
export class GuestCheckAdapter implements GuestCheckPort {
  constructor(private readonly oauthService: OauthService) {}

  async isNicknameExists(nickname: string): Promise<boolean> {
    return this.oauthService.isNicknameExists(nickname)
  }
}
