import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { Response } from 'express'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Access Token 발급
   */
  signAccess(userId: string): string {
    const expiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
    // @ts-expect-error - expiresIn accepts string like '15m' but type definition is strict
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET') || 'access_secret',
        expiresIn,
      },
    )
  }

  /**
   * Refresh Token 발급
   */
  signRefresh(userId: string): string {
    const expiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '14d'
    // @ts-expect-error - expiresIn accepts string like '14d' but type definition is strict
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret',
        expiresIn,
      },
    )
  }

  /**
   * Access Token과 Refresh Token 발급
   */
  generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.signAccess(userId),
      refreshToken: this.signRefresh(userId),
    }
  }

  /**
   * 쿠키에 토큰 설정
   */
  setTokensInCookie(res: Response, accessToken: string, refreshToken: string): void {
    const isSecure = this.config.get<string>('NODE_ENV') === 'production'
    const accessExpiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '14d'

    // Access Token 쿠키 설정
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: this.parseExpiresIn(accessExpiresIn),
    })

    // Refresh Token 쿠키 설정
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/auth',
      maxAge: this.parseExpiresIn(refreshExpiresIn),
    })
  }

  /**
   * expiresIn 문자열을 밀리초로 변환 (예: '15m' -> 900000)
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/)
    if (!match) return 60 * 60 * 1000 // 기본값 15분

    const value = parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
      case 's':
        return value * 1000
      case 'm':
        return value * 60 * 1000
      case 'h':
        return value * 60 * 60 * 1000
      case 'd':
        return value * 24 * 60 * 60 * 1000
      default:
        return 15 * 60 * 1000
    }
  }
}
