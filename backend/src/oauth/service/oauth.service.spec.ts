import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { OauthService } from './oauth.service'
import { TokenService } from './token.service'
import { PrismaService } from 'src/prisma/prisma.service'
import type { OAuthProfile } from '../types/oauth.types'

describe('OauthService', () => {
  let service: OauthService

  const mockTokenService = {
    generateTokens: jest.fn(),
    refresh: jest.fn(),
  }

  let users: Array<{ id: string; nickname: string; avatarUrl: string | null; tier: string; rating: number }>
  let oauths: Array<{ id: string; userId: string; provider: string; code: string }>

  const createMockPrismaBase = () => ({
    user: {
      findUnique: jest.fn(({ where }: { where: { id?: string; nickname?: string } }) => {
        if (where.id) return Promise.resolve(users.find(u => u.id === where.id) ?? null)
        if (where.nickname) return Promise.resolve(users.find(u => u.nickname === where.nickname) ?? null)
        return Promise.resolve(null)
      }),
      create: jest.fn(({ data }: { data: { id: string; nickname: string; avatarUrl: string | null; tier: string; rating: number } }) => {
        const record = { ...data }
        users.push(record)
        return Promise.resolve(record)
      }),
      update: jest.fn(({ where, data }: { where: { id: string }; data: { nickname: string } }) => {
        const user = users.find(u => u.id === where.id)
        if (!user) return Promise.resolve(null)
        user.nickname = data.nickname
        return Promise.resolve(user)
      }),
    },
    oAuth: {
      findFirst: jest.fn(({ where }: { where: { provider?: string; code?: string; userId?: string } }) => {
        if (where.userId) {
          return Promise.resolve(oauths.find(o => o.userId === where.userId) ?? null)
        }
        if (where.provider && where.code) {
          const oauth = oauths.find(o => o.provider === where.provider && o.code === where.code)
          if (!oauth) return Promise.resolve(null)
          const user = users.find(u => u.id === oauth.userId)
          return Promise.resolve({ ...oauth, user })
        }
        return Promise.resolve(null)
      }),
      create: jest.fn(({ data }: { data: { id: string; userId: string; provider: string; code: string } }) => {
        const record = { ...data }
        oauths.push(record)
        return Promise.resolve(record)
      }),
    },
  })

  let mockPrismaBase: ReturnType<typeof createMockPrismaBase>
  let mockPrisma: ReturnType<typeof createMockPrismaBase> & { $transaction: jest.Mock }

  beforeEach(async () => {
    users = []
    oauths = []

    mockPrismaBase = createMockPrismaBase()
    mockPrisma = {
      ...mockPrismaBase,
      $transaction: jest.fn((callback: (tx: typeof mockPrismaBase) => Promise<unknown>) => callback(mockPrismaBase)),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OauthService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile()

    service = module.get<OauthService>(OauthService)

    jest.clearAllMocks()
    mockTokenService.generateTokens.mockReset()
    mockTokenService.refresh.mockReset()
  })

  describe('findOrCreateUser', () => {
    it('새로운 사용자를 생성한다', async () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const user = await service.findOrCreateUser(profile)

      expect(user).toBeDefined()
      expect(user.provider).toBe('github')
      expect(user.providerId).toBe('12345')
      expect(user.nickname).toBe('사용자 12345')
      expect(user.avatarUrl).toBe('https://example.com/avatar.jpg')
      expect(user.id).toBeDefined()
      expect(typeof user.id).toBe('string')
    })

    it('같은 provider와 providerId로 다시 호출하면 기존 사용자를 반환한다', async () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const user1 = await service.findOrCreateUser(profile)
      const user2 = await service.findOrCreateUser(profile)

      expect(user1.id).toBe(user2.id)
    })

    it('다른 providerId면 새로운 사용자를 생성한다', async () => {
      const profile1: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/avatar1.jpg',
      }

      const profile2: OAuthProfile = {
        provider: 'github',
        providerId: '67890',
        avatarUrl: 'https://example.com/avatar2.jpg',
      }

      const user1 = await service.findOrCreateUser(profile1)
      const user2 = await service.findOrCreateUser(profile2)

      expect(user1).not.toBe(user2)
      expect(user1.id).not.toBe(user2.id)
    })

    it('다른 provider면 새로운 사용자를 생성한다', async () => {
      const githubProfile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/github.jpg',
      }

      const kakaoProfile: OAuthProfile = {
        provider: 'kakao',
        providerId: '12345',
        avatarUrl: 'https://example.com/kakao.jpg',
      }

      const githubUser = await service.findOrCreateUser(githubProfile)
      const kakaoUser = await service.findOrCreateUser(kakaoProfile)

      expect(githubUser).not.toBe(kakaoUser)
      expect(githubUser.id).not.toBe(kakaoUser.id)
    })
  })

  describe('loginWithGithub', () => {
    it('GitHub 프로필로 로그인하고 토큰을 발급한다', async () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/avatar.jpg',
      }
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }

      mockTokenService.generateTokens.mockReturnValue(mockTokens)
      mockPrisma.oAuth.findFirst.mockResolvedValue(null as never)
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id',
        nickname: '사용자 12345',
        tier: 'UNRANKED',
        rating: 0,
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never)
      mockPrisma.oAuth.create.mockResolvedValue({
        id: 'oauth-id',
        userId: 'user-id',
        provider: 'github',
        code: '12345',
      } as never)

      const result = await service.loginWithGithub(profile)

      expect(result).toEqual({
        ...mockTokens,
        user: expect.objectContaining({
          id: expect.any(String),
          provider: 'github',
          providerId: '12345',
          nickname: '사용자 12345',
        }),
      })
      expect(mockTokenService.generateTokens).toHaveBeenCalledTimes(1)
    })

    it('같은 GitHub 사용자가 다시 로그인하면 기존 사용자로 토큰을 발급한다', async () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
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
      mockPrisma.oAuth.findFirst.mockResolvedValue({
        id: 'oauth-id',
        userId: 'user-id',
        provider: 'github',
        code: '12345',
        user: {
          id: 'user-id',
          nickname: '사용자 12345',
          tier: 'UNRANKED',
          rating: 0,
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as never)

      const result1 = await service.loginWithGithub(profile)
      const result2 = await service.loginWithGithub(profile)

      expect(result1).toEqual({
        ...mockTokens1,
        user: expect.objectContaining({
          id: 'user-id',
          provider: 'github',
          providerId: '12345',
        }),
      })
      expect(result2).toEqual({
        ...mockTokens2,
        user: expect.objectContaining({
          id: 'user-id',
          provider: 'github',
          providerId: '12345',
        }),
      })
      expect(mockTokenService.generateTokens).toHaveBeenCalledTimes(2)
    })
  })

  describe('loginWithKakao', () => {
    it('Kakao 프로필로 로그인하고 토큰을 발급한다', async () => {
      const profile: OAuthProfile = {
        provider: 'kakao',
        providerId: '67890',
        avatarUrl: 'https://example.com/kakao-avatar.jpg',
      }

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }

      mockTokenService.generateTokens.mockReturnValue(mockTokens)
      mockPrisma.oAuth.findFirst.mockResolvedValue(null as never)
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id',
        nickname: '사용자 67890',
        tier: 'UNRANKED',
        rating: 0,
        avatarUrl: 'https://example.com/kakao-avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never)
      mockPrisma.oAuth.create.mockResolvedValue({
        id: 'oauth-id',
        userId: 'user-id',
        provider: 'kakao',
        code: '67890',
      } as never)

      const result = await service.loginWithKakao(profile)

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
    it('존재하는 userId로 사용자를 조회한다', async () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      mockTokenService.generateTokens.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      })

      await service.loginWithGithub(profile)
      const createdUser = await service.findOrCreateUser(profile)
      const foundUser = await service.findUserById(createdUser.id)

      expect(foundUser).toEqual(createdUser)
      expect(foundUser.id).toBe(createdUser.id)
    })

    it('존재하지 않는 userId로 조회하면 NotFoundException을 던진다', async () => {
      await expect(service.findUserById('non-existent-id')).rejects.toThrow(NotFoundException)
      await expect(service.findUserById('non-existent-id')).rejects.toThrow('사용자를 찾을 수 없습니다.')
    })

    it('여러 사용자 중 특정 userId를 조회한다', async () => {
      const profile1: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/avatar1.jpg',
      }

      const profile2: OAuthProfile = {
        provider: 'github',
        providerId: '67890',
        avatarUrl: 'https://example.com/avatar2.jpg',
      }

      mockTokenService.generateTokens.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      })

      await service.loginWithGithub(profile1)
      await service.loginWithGithub(profile2)

      const user1 = await service.findOrCreateUser(profile1)
      const user2 = await service.findOrCreateUser(profile2)

      const foundUser1 = await service.findUserById(user1.id)
      const foundUser2 = await service.findUserById(user2.id)

      expect(foundUser1.id).toBe(user1.id)
      expect(foundUser2.id).toBe(user2.id)
      expect(foundUser1.id).not.toBe(foundUser2.id)
    })
  })

  describe('updateUserNickname', () => {
    it('존재하는 사용자의 닉네임을 성공적으로 변경한다', async () => {
      const profile: OAuthProfile = {
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      mockTokenService.generateTokens.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      })

      await service.loginWithGithub(profile)
      const createdUser = await service.findOrCreateUser(profile)
      const newNickname = 'newNickname'

      const result = await service.updateUserNickname(createdUser.id, newNickname)

      expect(result).toBeDefined()
      expect(result.id).toBe(createdUser.id)
      expect(result.nickname).toBe(newNickname)
      expect(result.avatarUrl).toBe(createdUser.avatarUrl || '')

      const updatedUser = await service.findUserById(createdUser.id)
      expect(updatedUser.nickname).toBe(newNickname)
    })
  })
})
