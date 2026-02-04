import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common'
import type { Request } from 'express'
import { BATTLE_PRIVACY_CHECK_PORT } from '../application/ports/tokens'
import type { BattlePrivacyCheckPort } from '../application/ports/out/battlePrivacyCheck.port'

@Injectable()
export class InviteAccessGuard implements CanActivate {
  constructor(@Inject(BATTLE_PRIVACY_CHECK_PORT) private readonly battlePrivacyCheckPort: BattlePrivacyCheckPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const battleId = request.params.id as string | undefined
    if (!battleId) return true

    const isPrivate = await this.battlePrivacyCheckPort.isPrivateBattle(battleId)
    if (!isPrivate) return true

    const inviteAccessCookie = request.cookies?.[`inviteAccess_${battleId}`] as string | undefined
    if (!inviteAccessCookie) {
      throw new ForbiddenException('비공개 배틀에 접근하려면 초대 코드가 필요합니다.')
    }
    return true
  }
}
