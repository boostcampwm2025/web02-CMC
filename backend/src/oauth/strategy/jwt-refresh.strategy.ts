import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { Request } from 'express'
import { ConfigService } from '@nestjs/config'

interface JwtRefreshPayload {
  sub: string
  iat?: number
  exp?: number
}

interface RefreshUser {
  userId: string
  refreshToken: string
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = req.cookies as Record<string, string> | undefined
          return cookies?.refresh_token || null
        },
      ]),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret',
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtRefreshPayload): RefreshUser {
    if (!payload?.sub) throw new UnauthorizedException('유효하지 않은 Refresh Token입니다.')

    const cookies = req.cookies as Record<string, string> | undefined
    const refreshToken = cookies?.refresh_token
    if (!refreshToken) throw new UnauthorizedException('Refresh Token이 없습니다.')

    return { userId: payload.sub, refreshToken }
  }
}
