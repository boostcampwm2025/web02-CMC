import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'
import type { Response } from 'express'
import { TokenService } from './token.service'
import { RedisRepository } from '../../redis/redis.repository'

describe('TokenService', () => {
  let service: TokenService

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  const mockRedisRepository = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  }

  beforeEach(async () => {
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
        {
          provide: RedisRepository,
          useValue: mockRedisRepository,
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
      mockRedisRepository.set.mockResolvedValue('OK')
    })

    it('userId로 Access Token과 Refresh Token을 발급하고 저장한다', async () => {
      const userId = 'user-123'
      const mockAccessToken = 'mock-access-token'
      const mockRefreshToken = 'mock-refresh-token'

      mockJwtService.sign.mockReturnValueOnce(mockRefreshToken).mockReturnValueOnce(mockAccessToken)

      mockJwtService.verify.mockReturnValue({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      const result = await service.generateTokens(userId)

      expect(result).toMatchObject({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        sessionId: expect.any(String),
      })
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2)
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test_refresh_secret',
      })
      expect(mockRedisRepository.set).toHaveBeenCalled()
    })

    it('Refresh Token의 userId가 일치하지 않으면 UnauthorizedException을 던진다', async () => {
      const userId = 'user-123'
      const mockRefreshToken = 'mock-refresh-token'

      mockJwtService.sign.mockReturnValue(mockRefreshToken)
      mockJwtService.verify.mockReturnValue({
        sub: 'different-user-id',
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      await expect(service.generateTokens(userId)).rejects.toThrow(UnauthorizedException)
      await expect(service.generateTokens(userId)).rejects.toThrow('Refresh Token의 userId가 일치하지 않습니다')
    })
  })

  describe('storeRefreshToken', () => {
    beforeEach(() => {
      mockRedisRepository.set.mockResolvedValue('OK')
    })

    it('Refresh Token을 저장한다', async () => {
      const userId = 'user-123'
      const sessionId = 'session-123'
      const mockRefreshToken = 'mock-refresh-token'

      mockJwtService.verify.mockReturnValue({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      await service.storeRefreshToken(sessionId, mockRefreshToken, userId)

      expect(mockJwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test_refresh_secret',
      })
      expect(mockRedisRepository.set).toHaveBeenCalled()
    })

    it('userId가 일치하지 않으면 UnauthorizedException을 던진다', async () => {
      const userId = 'user-123'
      const sessionId = 'session-123'
      const mockRefreshToken = 'mock-refresh-token'

      mockJwtService.verify.mockReturnValue({
        sub: 'different-user-id',
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      })

      await expect(service.storeRefreshToken(sessionId, mockRefreshToken, userId)).rejects.toThrow(UnauthorizedException)
      await expect(service.storeRefreshToken(sessionId, mockRefreshToken, userId)).rejects.toThrow('Refresh Token의 userId가 일치하지 않습니다')
    })
  })

  describe('refresh', () => {
    const userId = 'user-123'
    const sessionId = 'session-123'
    const mockNewAccessToken = 'new-access-token'
    const mockNewRefreshToken = 'new-refresh-token'

    beforeEach(() => {
      jest.clearAllMocks()
      mockJwtService.verify.mockImplementation(() => ({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      }))
      mockRedisRepository.set.mockResolvedValue('OK')
    })

    it('유효한 세션 ID로 새로운 토큰 쌍을 발급한다', async () => {
      const storedTokenData = JSON.stringify({
        userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      })

      mockRedisRepository.get.mockResolvedValue(storedTokenData)
      mockJwtService.sign.mockReturnValueOnce(mockNewRefreshToken).mockReturnValueOnce(mockNewAccessToken)

      const result = await service.refresh(sessionId)

      expect(result).toMatchObject({
        accessToken: mockNewAccessToken,
        refreshToken: mockNewRefreshToken,
        sessionId: expect.any(String),
      })
      expect(mockRedisRepository.get).toHaveBeenCalledWith(`session:${sessionId}`)
      expect(mockRedisRepository.set).toHaveBeenCalled()
    })

    it('존재하지 않는 세션이면 UnauthorizedException을 던진다', async () => {
      mockRedisRepository.get.mockResolvedValue(null)

      await expect(service.refresh('invalid-session')).rejects.toThrow(UnauthorizedException)
      await expect(service.refresh('invalid-session')).rejects.toThrow('유효하지 않은 Refresh Token입니다')
    })

    it('이미 무효화된 세션이면 UnauthorizedException을 던진다', async () => {
      const storedTokenData = JSON.stringify({
        userId,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isRevoked: true,
      })

      mockRedisRepository.get.mockResolvedValue(storedTokenData)
      mockRedisRepository.keys.mockResolvedValue([])

      await expect(service.refresh(sessionId)).rejects.toThrow(UnauthorizedException)
      await expect(service.refresh(sessionId)).rejects.toThrow('Refresh Token 재사용이 감지되었습니다')
    })

    it('만료된 세션이면 UnauthorizedException을 던진다', async () => {
      const pastDate = new Date(Date.now() - 1000)
      const storedTokenData = JSON.stringify({
        userId,
        exp: Math.floor(Date.now() / 1000) - 1,
        expiresAt: pastDate,
        isRevoked: false,
      })

      mockRedisRepository.get.mockResolvedValue(storedTokenData)

      await expect(service.refresh(sessionId)).rejects.toThrow(UnauthorizedException)
      await expect(service.refresh(sessionId)).rejects.toThrow('만료된 Refresh Token입니다')
    })
  })

  describe('revokeRefreshToken', () => {
    it('세션을 삭제한다', async () => {
      const sessionId = 'session-123'
      mockRedisRepository.del.mockResolvedValue(1)

      await service.revokeRefreshToken(sessionId)

      expect(mockRedisRepository.del).toHaveBeenCalledWith(`session:${sessionId}`)
    })
  })

  describe('revokeAllRefreshTokensForUser', () => {
    it('특정 사용자의 모든 세션을 삭제한다', async () => {
      const userId1 = 'user-1'
      const userId2 = 'user-2'
      const session1 = 'session-1'
      const session2 = 'session-2'
      const session3 = 'session-3'

      const tokenData1 = JSON.stringify({
        userId: userId1,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      })

      const tokenData2 = JSON.stringify({
        userId: userId2,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      })

      const tokenData3 = JSON.stringify({
        userId: userId1,
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      })

      mockRedisRepository.keys.mockResolvedValue([`session:${session1}`, `session:${session2}`, `session:${session3}`])
      mockRedisRepository.get.mockResolvedValueOnce(tokenData1).mockResolvedValueOnce(tokenData2).mockResolvedValueOnce(tokenData3)
      mockRedisRepository.del.mockResolvedValue(1)

      await service.revokeAllRefreshTokensForUser(userId1)

      expect(mockRedisRepository.del).toHaveBeenCalledWith(`session:${session1}`)
      expect(mockRedisRepository.del).toHaveBeenCalledWith(`session:${session3}`)
      expect(mockRedisRepository.del).not.toHaveBeenCalledWith(`session:${session2}`)
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
    it('쿠키에 Access Token과 Session ID를 설정한다', () => {
      const mockCookie = jest.fn()
      const mockRes = {
        cookie: mockCookie,
      } as unknown as Response<Record<string, unknown>>

      const accessToken = 'access-token'
      const sessionId = 'session-id'

      service.setTokensInCookie(mockRes, accessToken, sessionId)

      expect(mockCookie).toHaveBeenCalledTimes(2)
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'none',
          path: '/',
        }),
      )
      expect(mockCookie).toHaveBeenCalledWith(
        'session_id',
        sessionId,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'none',
          path: '/api/auth',
        }),
      )
    })

    //   it('프로덕션 환경에서는 secure 플래그가 true이다', async () => {
    //     const prodMockConfigService = {
    //       get: jest.fn((key: string) => {
    //         if (key === 'NODE_ENV') return 'production'
    //         const config: Record<string, string> = {
    //           JWT_ACCESS_EXPIRES_IN: '15m',
    //           JWT_REFRESH_EXPIRES_IN: '14d',
    //           JWT_ACCESS_SECRET: 'test_access_secret',
    //           JWT_REFRESH_SECRET: 'test_refresh_secret',
    //         }
    //         return config[key]
    //       }),
    //     }

    //     const prodModule: TestingModule = await Test.createTestingModule({
    //       providers: [
    //         TokenService,
    //         {
    //           provide: JwtService,
    //           useValue: mockJwtService,
    //         },
    //         {
    //           provide: ConfigService,
    //           useValue: prodMockConfigService,
    //         },
    //       ],
    //     }).compile()

    //     const prodService = prodModule.get<TokenService>(TokenService)
    //     const mockCookie = jest.fn()
    //     const mockRes = {
    //       cookie: mockCookie,
    //     } as unknown as Response<Record<string, unknown>>

    //     prodService.setTokensInCookie(mockRes, 'access', 'refresh')

    //     expect(mockCookie).toHaveBeenCalledWith('access_token', 'access', expect.objectContaining({ secure: true }))
    //   })
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
        sameSite: 'none',
        path: '/',
      })
      expect(mockClearCookie).toHaveBeenCalledWith('session_id', {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        path: '/api/auth',
      })
    })
  })
})
