import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

@Injectable()
export class RefreshGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const cookies = request.cookies as Record<string, string> | undefined
    const sessionId = cookies?.session_id

    if (!sessionId) {
      throw new UnauthorizedException('세션이 없습니다.')
    }

    request.user = { userId: '', sessionId }
    return true
  }
}
