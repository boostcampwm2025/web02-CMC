import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Request } from 'express'
import { BattlesService } from '../service/battles.service'

@Injectable()
export class InviteAccessGuard implements CanActivate {
  constructor(private readonly battlesService: BattlesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const battleId = request.params.id as string | undefined

    if (!battleId) {
      return true
    }

    // 비공개 배틀인지 확인
    const isPrivate = await this.battlesService.isPrivateBattle(battleId)
    if (!isPrivate) {
      return true
    }

    // 비공개 배틀이면 쿠키 확인
    const inviteAccessCookie = request.cookies?.[`inviteAccess:${battleId}`] as string | undefined
    if (!inviteAccessCookie) {
      throw new ForbiddenException('비공개 배틀에 접근하려면 초대 코드가 필요합니다.')
    }

    return true
  }
}
