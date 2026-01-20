import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'
import type { Response } from 'express'
import { TokenService } from './token.service'

describe('TokenService', () => {
  let service: TokenService

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    // 기본 설정값 모킹 (모듈 생성 전에 설정)
    mockConfigService.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        JWT_ACCESS_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '14d',
        JWT_ACCESS_SECRET: 'test_access_secret',
        JWT_REFRESH_SECRET: 'test_refresh_secret',
        NODE_ENV: 'test',
      }
      return config[key]
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<TokenService>(TokenService)
  })

  describe('signAccess', () => {
    it('userId로 Access Token을 발급한다', () => {
      const userId = 'user-123'
      const mockToken = 'mock-access-token'

      mockJwtService.sign.mockReturnValue(mockToken)

      const result = service.signAccess(userId)

      expect(result).toBe(mockToken)
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: userId },
        expect.objectContaining({
          secret: 'test_access_secret',
          expiresIn: '15m',
        }),
      )
    })
  })

  describe('signRefresh', () => {
    it('userId로 Refresh Token을 발급한다', () => {
      const userId = 'user-123'
      const mockToken = 'mock-refresh-token'

      mockJwtService.sign.mockReturnValue(mockToken)

      const result = service.signRefresh(userId)

      expect(result).toBe(mockToken)
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: userId },
        expect.objectContaining({
          secret: 'test_refresh_secret',
          expiresIn: '14d',
        }),
      )
    })
  })

  describe('generateTokens', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('userId로 Access Token과 Refresh Token을 발급하고 저장한다', () => {
      const userId = 'user-123'
      const mockAccessToken = 'mock-access-token'
      const mockRefreshToken = 'mock-refresh-token'

      mockJwtService.sign.mockReturnValueOnce(mockRefreshToken).mockReturnValueOnce(mockAccessToken)

      mockJwtService.verify.mockReturnValue({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      const result = service.generateTokens(userId)

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      })
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2)
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test_refresh_secret',
      })
    })

    it('Refresh Token의 userId가 일치하지 않으면 UnauthorizedException을 던진다', () => {
      const userId = 'user-123'
      const mockRefreshToken = 'mock-refresh-token'

      mockJwtService.sign.mockReturnValue(mockRefreshToken)
      mockJwtService.verify.mockReturnValue({
        sub: 'different-user-id',
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      expect(() => service.generateTokens(userId)).toThrow(UnauthorizedException)
      expect(() => service.generateTokens(userId)).toThrow('Refresh Token의 userId가 일치하지 않습니다')
    })
  })

  describe('storeRefreshToken', () => {
    it('Refresh Token을 저장한다', () => {
      const userId = 'user-123'
      const mockRefreshToken = 'mock-refresh-token'

      mockJwtService.verify.mockReturnValue({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      service.storeRefreshToken(mockRefreshToken, userId)

      expect(mockJwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test_refresh_secret',
      })
    })

    it('userId가 일치하지 않으면 UnauthorizedException을 던진다', () => {
      const userId = 'user-123'
      const mockRefreshToken = 'mock-refresh-token'

      mockJwtService.verify.mockReturnValue({
        sub: 'different-user-id',
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      expect(() => service.storeRefreshToken(mockRefreshToken, userId)).toThrow(UnauthorizedException)
      expect(() => service.storeRefreshToken(mockRefreshToken, userId)).toThrow('Refresh Token의 userId가 일치하지 않습니다')
    })
  })

  describe('refresh', () => {
    const userId = 'user-123'
    const mockRefreshToken = 'valid-refresh-token'
    const mockNewAccessToken = 'new-access-token'
    const mockNewRefreshToken = 'new-refresh-token'

    beforeEach(() => {
      jest.clearAllMocks()
      // verify는 여러 번 호출될 수 있으므로 mockImplementation 사용
      mockJwtService.verify.mockImplementation(() => ({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      }))
    })

    it('유효한 Refresh Token으로 새로운 토큰 쌍을 발급한다', () => {
      // 초기 토큰 생성
      mockJwtService.sign.mockReturnValueOnce(mockRefreshToken).mockReturnValueOnce('initial-access-token')

      const tokens = service.generateTokens(userId)
      const actualRefreshToken = tokens.refreshToken

      // refresh 시 새로운 토큰 생성
      mockJwtService.sign.mockReturnValueOnce(mockNewRefreshToken).mockReturnValueOnce(mockNewAccessToken)

      const result = service.refresh(actualRefreshToken)

      expect(result).toEqual({
        accessToken: mockNewAccessToken,
        refreshToken: mockNewRefreshToken,
      })
    })

    it('존재하지 않는 Refresh Token이면 UnauthorizedException을 던진다', () => {
      expect(() => service.refresh('invalid-token')).toThrow(UnauthorizedException)
      expect(() => service.refresh('invalid-token')).toThrow('유효하지 않은 Refresh Token입니다')
    })

    it('이미 무효화된 Refresh Token이면 UnauthorizedException을 던진다', () => {
      // 초기 토큰 생성
      const initialRefreshToken = 'initial-refresh-token'
      mockJwtService.sign.mockReturnValueOnce(initialRefreshToken).mockReturnValueOnce('initial-access-token')

      mockJwtService.verify.mockImplementation(() => ({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      }))

      const tokens = service.generateTokens(userId)
      const actualRefreshToken = tokens.refreshToken
      expect(actualRefreshToken).toBe(initialRefreshToken)

      const newRefreshToken = 'new-refresh-token'
      mockJwtService.sign.mockReturnValueOnce(newRefreshToken).mockReturnValueOnce('new-access-token')

      const refreshResult = service.refresh(actualRefreshToken)

      expect(refreshResult.refreshToken).toBe(newRefreshToken)
      expect(() => service.refresh(actualRefreshToken)).toThrow(UnauthorizedException)
      expect(() => service.refresh(actualRefreshToken)).toThrow('Refresh Token 재사용이 감지되었습니다')
    })

    it('만료된 Refresh Token이면 UnauthorizedException을 던진다', () => {
      const expiredToken = 'expired-refresh-token'

      // 토큰을 먼저 생성
      mockJwtService.sign.mockReturnValueOnce(expiredToken).mockReturnValueOnce('access')
      mockJwtService.verify.mockReturnValue({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      const tokens = service.generateTokens(userId)
      const actualRefreshToken = tokens.refreshToken

      const futureDate = new Date()
      const expiresInMs = service.parseExpiresIn(service.REFRESH_TOKEN_EXPIRES_IN)
      futureDate.setTime(futureDate.getTime() + expiresInMs + 1000)

      jest.useFakeTimers()
      jest.setSystemTime(futureDate)

      expect(() => service.refresh(actualRefreshToken)).toThrow(UnauthorizedException)
      expect(() => service.refresh(actualRefreshToken)).toThrow('만료된 Refresh Token입니다')

      jest.useRealTimers()
    })
  })

  describe('revokeRefreshToken', () => {
    it('Refresh Token을 무효화한다', () => {
      const userId = 'user-123'
      const mockRefreshToken = 'mock-refresh-token'

      mockJwtService.sign.mockReturnValue(mockRefreshToken)
      mockJwtService.verify.mockReturnValue({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      service.generateTokens(userId)
      service.revokeRefreshToken(mockRefreshToken)

      expect(() => service.refresh(mockRefreshToken)).toThrow(UnauthorizedException)
    })
  })

  describe('revokeAllRefreshTokensForUser', () => {
    it('특정 사용자의 모든 Refresh Token을 무효화한다', () => {
      const userId1 = 'user-1'
      const userId2 = 'user-2'
      const mockToken1 = 'token-1'
      const mockToken2 = 'token-2'
      const mockToken3 = 'token-3'

      mockJwtService.sign
        .mockReturnValueOnce(mockToken1)
        .mockReturnValueOnce('access-1')
        .mockReturnValueOnce(mockToken2)
        .mockReturnValueOnce('access-2')
        .mockReturnValueOnce(mockToken3)
        .mockReturnValueOnce('access-3')

      mockJwtService.verify.mockReturnValue({
        sub: userId1,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      service.generateTokens(userId1)

      mockJwtService.verify.mockReturnValue({
        sub: userId2,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      service.generateTokens(userId2)

      mockJwtService.verify.mockReturnValue({
        sub: userId1,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      service.generateTokens(userId1)

      service.revokeAllRefreshTokensForUser(userId1)

      // revokeAllRefreshTokensForUser는 isRevoked = true로 설정하므로, refresh 시도 시 재사용 감지 에러가 발생해야 함
      expect(() => service.refresh(mockToken1)).toThrow(UnauthorizedException)
      expect(() => service.refresh(mockToken1)).toThrow('Refresh Token 재사용이 감지되었습니다')
      expect(() => service.refresh(mockToken3)).toThrow(UnauthorizedException)
      expect(() => service.refresh(mockToken3)).toThrow('Refresh Token 재사용이 감지되었습니다')
    })
  })

  describe('parseExpiresIn', () => {
    it('초 단위 문자열을 밀리초로 변환한다', () => {
      expect(service.parseExpiresIn('30s')).toBe(30000)
    })

    it('분 단위 문자열을 밀리초로 변환한다', () => {
      expect(service.parseExpiresIn('15m')).toBe(15 * 60 * 1000)
    })

    it('시간 단위 문자열을 밀리초로 변환한다', () => {
      expect(service.parseExpiresIn('2h')).toBe(2 * 60 * 60 * 1000)
    })

    it('일 단위 문자열을 밀리초로 변환한다', () => {
      expect(service.parseExpiresIn('14d')).toBe(14 * 24 * 60 * 60 * 1000)
    })

    it('유효하지 않은 형식이면 기본값(1시간)을 반환한다', () => {
      expect(service.parseExpiresIn('invalid')).toBe(60 * 60 * 1000)
    })

    it('빈 문자열이면 기본값을 반환한다', () => {
      expect(service.parseExpiresIn('')).toBe(60 * 60 * 1000)
    })
  })

  describe('setTokensInCookie', () => {
    it('쿠키에 Access Token과 Refresh Token을 설정한다', () => {
      const mockCookie = jest.fn()
      const mockRes = {
        cookie: mockCookie,
      } as unknown as Response<Record<string, unknown>>

      const accessToken = 'access-token'
      const refreshToken = 'refresh-token'

      service.setTokensInCookie(mockRes, accessToken, refreshToken)

      expect(mockCookie).toHaveBeenCalledTimes(3)
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
        }),
      )
      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        refreshToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/auth',
        }),
      )
    })

    it('프로덕션 환경에서는 secure 플래그가 true이다', async () => {
      const prodMockConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'NODE_ENV') return 'production'
          const config: Record<string, string> = {
            JWT_ACCESS_EXPIRES_IN: '15m',
            JWT_REFRESH_EXPIRES_IN: '14d',
            JWT_ACCESS_SECRET: 'test_access_secret',
            JWT_REFRESH_SECRET: 'test_refresh_secret',
          }
          return config[key]
        }),
      }

      const prodModule: TestingModule = await Test.createTestingModule({
        providers: [
          TokenService,
          {
            provide: JwtService,
            useValue: mockJwtService,
          },
          {
            provide: ConfigService,
            useValue: prodMockConfigService,
          },
        ],
      }).compile()

      const prodService = prodModule.get<TokenService>(TokenService)
      const mockCookie = jest.fn()
      const mockRes = {
        cookie: mockCookie,
      } as unknown as Response<Record<string, unknown>>

      prodService.setTokensInCookie(mockRes, 'access', 'refresh')

      expect(mockCookie).toHaveBeenCalledWith('access_token', 'access', expect.objectContaining({ secure: true }))
    })
  })

  describe('clearAuthCookies', () => {
    it('인증 관련 쿠키를 모두 삭제한다', () => {
      const mockClearCookie = jest.fn()
      const mockRes = {
        clearCookie: mockClearCookie,
      } as unknown as Response<Record<string, unknown>>

      service.clearAuthCookies(mockRes)

      expect(mockClearCookie).toHaveBeenCalledTimes(2)
      expect(mockClearCookie).toHaveBeenCalledWith('access_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      })
      expect(mockClearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/auth',
      })
    })
  })
})
