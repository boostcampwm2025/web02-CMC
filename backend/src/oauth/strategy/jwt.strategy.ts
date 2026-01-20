import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { Request } from 'express'
import { ConfigService } from '@nestjs/config'

interface JwtPayload {
  sub: string
  iat?: number
  exp?: number
}

interface JwtUser {
  id: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = req.cookies as Record<string, string> | undefined
          return cookies?.access_token || null
        },
      ]),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') || 'access_secret',
    })
  }

  validate(payload: JwtPayload): JwtUser {
    if (!payload?.sub) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.')
    }
    return { id: payload.sub }
  }
}
