import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends PassportAuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }
}
