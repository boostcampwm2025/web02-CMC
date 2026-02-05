import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { Response } from 'express'
import { v7 as uuidv7 } from 'uuid'
import { RedisRepository } from '../../redis/redis.repository'

type StoredRefreshToken = {
  userId: string
  exp: number
  expiresAt: Date
  isRevoked: boolean
}

@Injectable()
export class TokenService {
  readonly ACCESS_TOKEN_EXPIRES_IN: string
  readonly REFRESH_TOKEN_EXPIRES_IN: string

  private readonly ACCESS_TOKEN_SECRET: string
  private readonly REFRESH_TOKEN_SECRET: string

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redisRepository: RedisRepository,
  ) {
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
  async generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const refreshToken = this.signRefresh(userId)
    const accessToken = this.signAccess(userId)
    const sessionId = uuidv7()

    await this.storeRefreshToken(sessionId, refreshToken, userId)

    return {
      accessToken,
      refreshToken,
      sessionId,
    }
  }

  /**
   * 쿠키에 토큰 설정
   */
  setTokensInCookie(res: Response, accessToken: string, sessionId: string): void {
    const isSecure = this.config.get<string>('NODE_ENV') === 'production'

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'none',
      path: '/',
      maxAge: this.parseExpiresIn(this.ACCESS_TOKEN_EXPIRES_IN),
    })

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'none',
      path: '/api/auth',
      maxAge: this.parseExpiresIn(this.REFRESH_TOKEN_EXPIRES_IN),
    })
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
  async storeRefreshToken(sessionId: string, refreshToken: string, userId: string): Promise<void> {
    const decoded = this.jwtService.verify<{ sub: string; exp: number }>(refreshToken, {
      secret: this.REFRESH_TOKEN_SECRET,
    })

    if (decoded.sub !== userId) {
      throw new UnauthorizedException('Refresh Token의 userId가 일치하지 않습니다')
    }

    const tokenData: StoredRefreshToken = {
      userId: decoded.sub,
      exp: decoded.exp,
      expiresAt: this.calculateRefreshTokenExpiry(),
      isRevoked: false,
    }

    const ttlSeconds = Math.floor(this.parseExpiresIn(this.REFRESH_TOKEN_EXPIRES_IN) / 1000)
    await this.redisRepository.set(`session:${sessionId}`, JSON.stringify(tokenData), ttlSeconds)
  }

  /**
   * 토큰 갱신 (RTR - Refresh Token Rotation 적용)
   * 기존 refresh token을 무효화하고 새로운 토큰 쌍을 발급
   */
  async refresh(sessionId: string): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const storedData = await this.redisRepository.get(`session:${sessionId}`)

    if (!storedData) {
      throw new UnauthorizedException('유효하지 않은 Refresh Token입니다')
    }

    const storedToken = JSON.parse(storedData) as StoredRefreshToken

    if (storedToken.isRevoked) {
      await this.revokeAllRefreshTokensForUser(storedToken.userId)
      throw new UnauthorizedException('Refresh Token 재사용이 감지되었습니다. 다시 로그인해주세요.')
    }

    if (new Date() > new Date(storedToken.expiresAt)) {
      throw new UnauthorizedException('만료된 Refresh Token입니다')
    }

    storedToken.isRevoked = true
    const shortTtl = 300
    await this.redisRepository.set(`session:${sessionId}`, JSON.stringify(storedToken), shortTtl)

    const newTokens = await this.generateTokens(storedToken.userId)
    return newTokens
  }

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    const keys = await this.redisRepository.keys('session:*')

    for (const key of keys) {
      const data = await this.redisRepository.get(key)
      if (data) {
        const token = JSON.parse(data) as StoredRefreshToken
        if (token.userId === userId) {
          await this.redisRepository.del(key)
        }
      }
    }
  }

  /**
   * Refresh Token 무효화
   */
  async revokeRefreshToken(sessionId: string): Promise<void> {
    await this.redisRepository.del(`session:${sessionId}`)
  }

  clearAuthCookies(res: Response): void {
    const isSecure = this.config.get<string>('NODE_ENV') === 'production'

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'none',
      path: '/',
    })

    res.clearCookie('session_id', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'none',
      path: '/api/auth',
    })
  }

  /**
   * expiresIn 문자열을 밀리초로 변환 (예: '15m' -> 900000)
   */
  parseExpiresIn(expiresIn: string): number {
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
