import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { OauthController } from './oauth.controller'
import { OauthService } from '../service/oauth.service'
import { TokenService } from '../service/token.service'
import type { OAuthProfile } from '../types/oauth.types'
import { OAuthUserResponseDto } from '../dto/oauthUserResponse.dto'
import type { Request as expressReq, Response as expressRes } from 'express'

describe('OauthController', () => {
  let controller: OauthController

  const mockOauthService = {
    loginWithGithub: jest.fn(),
    loginWithKakao: jest.fn(),
    refreshToken: jest.fn(),
    findUserById: jest.fn(),
    updateUserNickname: jest.fn(),
    findOrCreateUser: jest.fn(),
    isInitialNickname: jest.fn(),
  }

  const mockTokenService = {
    setTokensInCookie: jest.fn(),
    revokeRefreshToken: jest.fn(),
    clearAuthCookies: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OauthController],
      providers: [
        {
          provide: OauthService,
          useValue: mockOauthService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    controller = module.get<OauthController>(OauthController)

    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'FRONTEND_URL') return 'http://localhost:5173'
      return undefined
    })

    jest.clearAllMocks()
  })

  describe('githubCallback', () => {
    it('GitHub 콜백에서 프로필을 받아 토큰을 발급하고 쿠키에 설정한다', async () => {
      const mockProfile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockUser = {
        id: 'user-123',
        provider: 'github',
        providerId: '12345',
        nickname: 'testUser',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      }

      const mockReq = {
        user: mockProfile,
      } as unknown as expressReq

      const mockRedirect = jest.fn()
      const mockRes = {
        cookie: jest.fn(),
        redirect: mockRedirect,
      } as unknown as expressRes

      mockOauthService.loginWithGithub.mockResolvedValue(mockTokens)
      mockOauthService.isInitialNickname.mockReturnValue(false)

      await controller.githubCallback(mockReq, mockRes)

      expect(mockOauthService.loginWithGithub).toHaveBeenCalledWith(mockProfile)
      expect(mockTokenService.setTokensInCookie).toHaveBeenCalledWith(mockRes, mockTokens.accessToken, mockTokens.refreshToken)
      expect(mockOauthService.isInitialNickname).toHaveBeenCalledWith(mockUser)
      expect(mockRedirect).toHaveBeenCalledWith('http://localhost:5173/auth/callback?redirect=%2F')
    })

    it('닉네임이 "사용자 "로 시작하면 닉네임 페이지로 리다이렉트한다', async () => {
      const mockProfile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockUser = {
        id: 'user-123',
        provider: 'github',
        providerId: '12345',
        nickname: '사용자 12345',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      }

      const mockReq = {
        user: mockProfile,
      } as unknown as expressReq

      const mockRedirect = jest.fn()
      const mockRes = {
        cookie: jest.fn(),
        redirect: mockRedirect,
      } as unknown as expressRes

      mockOauthService.loginWithGithub.mockResolvedValue(mockTokens)
      mockOauthService.isInitialNickname.mockReturnValue(true)

      await controller.githubCallback(mockReq, mockRes)

      expect(mockOauthService.isInitialNickname).toHaveBeenCalledWith(mockUser)
      expect(mockRedirect).toHaveBeenCalledWith('http://localhost:5173/auth/callback?redirect=%2Fnickname')
    })
  })

  describe('kakaoCallback', () => {
    it('Kakao 콜백에서 프로필을 받아 토큰을 발급하고 쿠키에 설정한다', async () => {
      const mockProfile: OAuthProfile = {
        provider: 'kakao',
        providerId: '67890',
        avatarUrl: 'https://example.com/kakao-avatar.jpg',
      }

      const mockUser = {
        id: 'user-123',
        provider: 'kakao',
        providerId: '67890',
        nickname: 'testUser',
        avatarUrl: 'https://example.com/kakao-avatar.jpg',
      }

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      }

      const mockReq = {
        user: mockProfile,
      } as unknown as expressReq

      const mockRedirect = jest.fn()
      const mockRes = {
        cookie: jest.fn(),
        redirect: mockRedirect,
      } as unknown as expressRes

      mockOauthService.loginWithKakao.mockResolvedValue(mockTokens)
      mockOauthService.isInitialNickname.mockReturnValue(false)

      await controller.kakaoCallback(mockReq, mockRes)

      expect(mockOauthService.loginWithKakao).toHaveBeenCalledWith(mockProfile)
      expect(mockTokenService.setTokensInCookie).toHaveBeenCalledWith(mockRes, mockTokens.accessToken, mockTokens.refreshToken)
      expect(mockOauthService.isInitialNickname).toHaveBeenCalledWith(mockUser)
      expect(mockRedirect).toHaveBeenCalledWith('http://localhost:5173/auth/callback?redirect=%2F')
    })

    it('닉네임이 "사용자 "로 시작하면 닉네임 페이지로 리다이렉트한다', async () => {
      const mockProfile: OAuthProfile = {
        provider: 'kakao',
        providerId: '67890',
        avatarUrl: 'https://example.com/kakao-avatar.jpg',
      }

      const mockUser = {
        id: 'user-123',
        provider: 'kakao',
        providerId: '67890',
        nickname: '사용자 67890',
        avatarUrl: 'https://example.com/kakao-avatar.jpg',
      }

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      }

      const mockReq = {
        user: mockProfile,
      } as unknown as expressReq

      const mockRedirect = jest.fn()
      const mockRes = {
        cookie: jest.fn(),
        redirect: mockRedirect,
      } as unknown as expressRes

      mockOauthService.loginWithKakao.mockResolvedValue(mockTokens)
      mockOauthService.isInitialNickname.mockReturnValue(true)

      await controller.kakaoCallback(mockReq, mockRes)

      expect(mockOauthService.isInitialNickname).toHaveBeenCalledWith(mockUser)
      expect(mockRedirect).toHaveBeenCalledWith('http://localhost:5173/auth/callback?redirect=%2Fnickname')
    })
  })

  describe('refresh', () => {
    it('Refresh Token으로 새로운 토큰을 발급하고 쿠키에 설정한다', () => {
      const mockUser = {
        userId: 'user-123',
        refreshToken: 'old-refresh-token',
      }

      const mockNewTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }

      const mockReq = {
        user: mockUser,
      } as unknown as expressReq

      const mockJson = jest.fn((data: unknown) => data)
      const mockRes = {
        cookie: jest.fn(),
        json: mockJson,
      } as unknown as expressRes

      mockOauthService.refreshToken.mockReturnValue(mockNewTokens)

      const result = controller.refresh(mockReq, mockRes)

      expect(mockOauthService.refreshToken).toHaveBeenCalledWith(mockUser.refreshToken)
      expect(mockTokenService.setTokensInCookie).toHaveBeenCalledWith(mockRes, mockNewTokens.accessToken, mockNewTokens.refreshToken)
      expect(mockJson).toHaveBeenCalledWith({ success: true })
      expect(result).toEqual({ success: true })
    })
  })

  describe('logout', () => {
    it('Refresh Token이 있으면 무효화하고 쿠키를 삭제한다', () => {
      const mockReq = {
        cookies: {
          refresh_token: 'refresh-token-to-revoke',
        },
      } as unknown as expressReq

      const mockRes = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      } as unknown as expressRes

      controller.logout(mockReq, mockRes)

      expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith('refresh-token-to-revoke')
      expect(mockTokenService.clearAuthCookies).toHaveBeenCalledWith(mockRes)
      expect(mockRes.json).toHaveBeenCalledWith({ success: true })
    })

    it('Refresh Token이 없어도 쿠키를 삭제한다', () => {
      const mockReq = {
        cookies: {},
      } as unknown as expressReq

      const mockRes = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      } as unknown as expressRes

      controller.logout(mockReq, mockRes)

      expect(mockTokenService.revokeRefreshToken).not.toHaveBeenCalled()
      expect(mockTokenService.clearAuthCookies).toHaveBeenCalledWith(mockRes)
      expect(mockRes.json).toHaveBeenCalledWith({ success: true })
    })
  })

  describe('getMe', () => {
    it('현재 로그인한 사용자 정보를 반환한다', async () => {
      const mockJwtUser = {
        id: 'user-123',
      }

      const mockUser = {
        id: 'user-123',
        provider: 'github',
        providerId: '12345',
        nickname: '사용자_12345',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockReq = {
        user: mockJwtUser,
      } as unknown as expressReq

      mockOauthService.findUserById.mockResolvedValue(mockUser)

      const result = await controller.getMe(mockReq)

      expect(mockOauthService.findUserById).toHaveBeenCalledWith(mockJwtUser.id)
      expect(result).toEqual(mockUser)
    })
  })

  describe('updateNickname', () => {
    it('닉네임을 성공적으로 변경하고 사용자 정보를 반환한다', async () => {
      const mockJwtUser = {
        id: 'user-123',
      }

      const mockDto = {
        nickname: 'newNickname',
      }

      const mockUpdatedUser: OAuthUserResponseDto = {
        id: 'user-123',
        nickname: 'newNickname',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockReq = {
        user: mockJwtUser,
        body: mockDto,
      } as unknown as expressReq

      mockOauthService.updateUserNickname.mockResolvedValue(mockUpdatedUser)

      const result = await controller.updateNickname(mockReq, mockDto)

      expect(mockOauthService.updateUserNickname).toHaveBeenCalledWith(mockJwtUser.id, mockDto.nickname)
      expect(result).toEqual(mockUpdatedUser)
    })
  })
})
