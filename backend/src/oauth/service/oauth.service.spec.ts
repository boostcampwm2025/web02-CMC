import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { OauthService } from './oauth.service'
import { TokenService } from './token.service'
import type { OAuthProfile } from '../types/oauth.types'

describe('OauthService', () => {
  let service: OauthService

  const mockTokenService = {
    generateTokens: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OauthService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile()

    service = module.get<OauthService>(OauthService)

    jest.clearAllMocks()
  })

  describe('findOrCreateUser', () => {
    it('새로운 사용자를 생성한다', () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        nickname: 'testuser',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const user = service.findOrCreateUser(profile)

      expect(user).toBeDefined()
      expect(user.provider).toBe('github')
      expect(user.providerId).toBe('12345')
      expect(user.nickname).toBe('testuser')
      expect(user.avatarUrl).toBe('https://example.com/avatar.jpg')
      expect(user.id).toBeDefined()
      expect(typeof user.id).toBe('string')
    })

    it('같은 provider와 providerId로 다시 호출하면 기존 사용자를 반환한다', () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        nickname: 'testuser',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const user1 = service.findOrCreateUser(profile)
      const user2 = service.findOrCreateUser(profile)

      expect(user1).toBe(user2)
      expect(user1.id).toBe(user2.id)
    })

    it('다른 providerId면 새로운 사용자를 생성한다', () => {
      const profile1: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        nickname: 'user1',
        avatarUrl: 'https://example.com/avatar1.jpg',
      }

      const profile2: OAuthProfile = {
        provider: 'github',
        providerId: '67890',
        nickname: 'user2',
        avatarUrl: 'https://example.com/avatar2.jpg',
      }

      const user1 = service.findOrCreateUser(profile1)
      const user2 = service.findOrCreateUser(profile2)

      expect(user1).not.toBe(user2)
      expect(user1.id).not.toBe(user2.id)
    })

    it('다른 provider면 새로운 사용자를 생성한다', () => {
      const githubProfile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        nickname: 'githubuser',
        avatarUrl: 'https://example.com/github.jpg',
      }

      const kakaoProfile: OAuthProfile = {
        provider: 'kakao',
        providerId: '12345',
        nickname: 'kakaouser',
        avatarUrl: 'https://example.com/kakao.jpg',
      }

      const githubUser = service.findOrCreateUser(githubProfile)
      const kakaoUser = service.findOrCreateUser(kakaoProfile)

      expect(githubUser).not.toBe(kakaoUser)
      expect(githubUser.id).not.toBe(kakaoUser.id)
    })
  })

  describe('loginWithGithub', () => {
    it('GitHub 프로필로 로그인하고 토큰을 발급한다', () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        nickname: 'testuser',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }

      mockTokenService.generateTokens.mockReturnValue(mockTokens)

      const result = service.loginWithGithub(profile)

      expect(result).toEqual(mockTokens)
      expect(mockTokenService.generateTokens).toHaveBeenCalledTimes(1)
    })

    it('같은 GitHub 사용자가 다시 로그인하면 기존 사용자로 토큰을 발급한다', () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        nickname: 'testuser',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockTokens1 = {
        accessToken: 'mock-access-token-1',
        refreshToken: 'mock-refresh-token-1',
      }

      const mockTokens2 = {
        accessToken: 'mock-access-token-2',
        refreshToken: 'mock-refresh-token-2',
      }

      mockTokenService.generateTokens.mockReturnValueOnce(mockTokens1).mockReturnValueOnce(mockTokens2)

      const result1 = service.loginWithGithub(profile)
      const result2 = service.loginWithGithub(profile)

      expect(result1).toEqual(mockTokens1)
      expect(result2).toEqual(mockTokens2)
      expect(mockTokenService.generateTokens).toHaveBeenCalledTimes(2)
    })
  })

  describe('loginWithKakao', () => {
    it('Kakao 프로필로 로그인하고 토큰을 발급한다', () => {
      const profile: OAuthProfile = {
        provider: 'kakao',
        providerId: '67890',
        nickname: '카카오유저',
        avatarUrl: 'https://example.com/kakao-avatar.jpg',
      }

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }

      mockTokenService.generateTokens.mockReturnValue(mockTokens)

      const result = service.loginWithKakao(profile)

      expect(result).toEqual(mockTokens)
      expect(mockTokenService.generateTokens).toHaveBeenCalledTimes(1)
    })
  })

  describe('refreshToken', () => {
    it('Refresh Token으로 새로운 토큰 쌍을 발급한다', () => {
      const refreshToken = 'old-refresh-token'
      const mockNewTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }

      mockTokenService.refresh.mockReturnValue(mockNewTokens)

      const result = service.refreshToken(refreshToken)

      expect(result).toEqual(mockNewTokens)
      expect(mockTokenService.refresh).toHaveBeenCalledWith(refreshToken)
    })
  })

  describe('findUserById', () => {
    it('존재하는 userId로 사용자를 조회한다', () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        nickname: 'testuser',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      mockTokenService.generateTokens.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      })

      service.loginWithGithub(profile)
      const createdUser = service.findOrCreateUser(profile)
      const foundUser = service.findUserById(createdUser.id)

      expect(foundUser).toEqual(createdUser)
      expect(foundUser.id).toBe(createdUser.id)
    })

    it('존재하지 않는 userId로 조회하면 NotFoundException을 던진다', () => {
      expect(() => service.findUserById('non-existent-id')).toThrow(NotFoundException)
      expect(() => service.findUserById('non-existent-id')).toThrow('사용자를 찾을 수 없습니다.')
    })

    it('여러 사용자 중 특정 userId를 조회한다', () => {
      const profile1: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        nickname: 'user1',
        avatarUrl: 'https://example.com/avatar1.jpg',
      }

      const profile2: OAuthProfile = {
        provider: 'github',
        providerId: '67890',
        nickname: 'user2',
        avatarUrl: 'https://example.com/avatar2.jpg',
      }

      mockTokenService.generateTokens.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      })

      service.loginWithGithub(profile1)
      service.loginWithGithub(profile2)

      const user1 = service.findOrCreateUser(profile1)
      const user2 = service.findOrCreateUser(profile2)

      const foundUser1 = service.findUserById(user1.id)
      const foundUser2 = service.findUserById(user2.id)

      expect(foundUser1.id).toBe(user1.id)
      expect(foundUser2.id).toBe(user2.id)
      expect(foundUser1.id).not.toBe(foundUser2.id)
    })
  })
})
