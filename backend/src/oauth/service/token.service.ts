import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { Response } from 'express'

type StoredRefreshToken = {
  userId: string
  exp: number
  expiresAt: Date
  isRevoked: boolean
}

@Injectable()
export class TokenService {
  private readonly ACCESS_TOKEN_EXPIRES_IN: string
  private readonly REFRESH_TOKEN_EXPIRES_IN: string

  private readonly ACCESS_TOKEN_SECRET: string
  private readonly REFRESH_TOKEN_SECRET: string

  //TODO: Redis 사용
  private readonly refreshTokenStore = new Map<string, StoredRefreshToken>()

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    // 생성자에서 상수 초기화
    this.ACCESS_TOKEN_EXPIRES_IN = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
    this.REFRESH_TOKEN_EXPIRES_IN = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '14d'
    this.ACCESS_TOKEN_SECRET = this.config.get<string>('JWT_ACCESS_SECRET') || 'access_secret'
    this.REFRESH_TOKEN_SECRET = this.config.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret'
  }
  /**
   * Access Token 발급
   */
  signAccess(userId: string): string {
    return this.jwtService.sign({ sub: userId }, {
      secret: this.ACCESS_TOKEN_SECRET,
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    } as Parameters<typeof this.jwtService.sign>[1])
  }

  /**
   * Refresh Token 발급
   */
  signRefresh(userId: string): string {
    return this.jwtService.sign({ sub: userId }, {
      secret: this.REFRESH_TOKEN_SECRET,
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    } as Parameters<typeof this.jwtService.sign>[1])
  }

  /**
   * Access Token과 Refresh Token 발급 및 저장
   */
  generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const refreshToken = this.signRefresh(userId)
    const accessToken = this.signAccess(userId)

    console.log(refreshToken)
    // Refresh Token만 저장 (RTR을 위해)
    this.storeRefreshToken(refreshToken, userId)

    return {
      accessToken,
      refreshToken,
    }
  }

  /**
   * 쿠키에 토큰 설정
   */
  setTokensInCookie(res: Response, accessToken: string, refreshToken: string): void {
    const isSecure = this.config.get<string>('NODE_ENV') === 'production'

    // Access Token 쿠키 설정
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: this.parseExpiresIn(this.ACCESS_TOKEN_EXPIRES_IN),
    })

    // Refresh Token 쿠키 설정
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/auth',
      maxAge: this.parseExpiresIn(this.REFRESH_TOKEN_EXPIRES_IN),
    })

    res.cookie('isLoggedIn', true, { httpOnly: false })
  }

  /**
   * Refresh Token 만료일 계산
   */
  private calculateRefreshTokenExpiry(): Date {
    const expiryDate = new Date()
    const milliseconds = this.parseExpiresIn(this.REFRESH_TOKEN_EXPIRES_IN)
    expiryDate.setTime(expiryDate.getTime() + milliseconds)
    return expiryDate
  }

  /**
   * Refresh Token 저장
   */
  private storeRefreshToken(refreshToken: string, userId: string): void {
    const decoded = this.jwtService.verify<{ sub: string; exp: number }>(refreshToken, {
      secret: this.REFRESH_TOKEN_SECRET,
    })

    // userId 검증 (토큰의 userId와 일치하는지 확인)
    if (decoded.sub !== userId) {
      throw new UnauthorizedException('Refresh Token의 userId가 일치하지 않습니다')
    }

    this.refreshTokenStore.set(refreshToken, {
      userId: decoded.sub,
      exp: decoded.exp,
      expiresAt: this.calculateRefreshTokenExpiry(),
      isRevoked: false,
    })
  }

  /**
   * 토큰 갱신 (RTR - Refresh Token Rotation 적용)
   * 기존 refresh token을 무효화하고 새로운 토큰 쌍을 발급
   */
  refresh(refreshToken: string): { accessToken: string; refreshToken: string } {
    // 토큰 조회
    const storedToken = this.refreshTokenStore.get(refreshToken)

    if (!storedToken) {
      throw new UnauthorizedException('유효하지 않은 Refresh Token입니다')
    }

    // 이미 폐기된(Revoked) 토큰인지 확인
    if (storedToken.isRevoked) {
      this.revokeAllRefreshTokensForUser(storedToken.userId)
      throw new UnauthorizedException('Refresh Token 재사용이 감지되었습니다. 다시 로그인해주세요.')
    }

    // 만료 기간 확인
    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('만료된 Refresh Token입니다')
    }

    // 기존 토큰 무효화 처리
    storedToken.isRevoked = true

    // 새로운 토큰 쌍 생성
    const newTokens = this.generateTokens(storedToken.userId)
    console.log(newTokens)

    // 새로운 Refresh Token 저장
    return newTokens
  }

  private revokeAllRefreshTokensForUser(userId: string): void {
    for (const [token, meta] of this.refreshTokenStore.entries()) {
      if (meta.userId === userId) this.refreshTokenStore.delete(token)
    }
  }

  /**
   * Refresh Token 무효화
   */
  revokeRefreshToken(refreshToken: string): void {
    this.refreshTokenStore.delete(refreshToken)
  }

  clearAuthCookies(res: Response): void {
    const isSecure = this.config.get<string>('NODE_ENV') === 'production'

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
    })

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/auth',
    })

    // 프론트 UI용
    res.clearCookie('isLoggedIn', { path: '/' })
  }

  /**
   * expiresIn 문자열을 밀리초로 변환 (예: '15m' -> 900000)
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/)
    if (!match) return 60 * 60 * 1000 // 기본값 1시간

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
