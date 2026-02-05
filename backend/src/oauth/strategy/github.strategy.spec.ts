import { GithubStrategy } from './github.strategy'
import type { ConfigService } from '@nestjs/config'

describe('GithubStrategy', () => {
  let strategy: GithubStrategy

  beforeEach(() => {
    const configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          GITHUB_CLIENT_ID: 'test-client-id',
          GITHUB_CLIENT_SECRET: 'test-secret',
          GITHUB_CALLBACK_URL: 'http://localhost:3000/auth/github/callback',
        }
        return config[key]
      }),
    } as unknown as ConfigService
    strategy = new GithubStrategy(configService)
  })

  describe('validate', () => {
    it('GitHub 프로필에서 OAuthProfile을 반환한다', () => {
      const profile = {
        id: '12345',
        photos: [{ value: 'https://avatars.github.com/12345' }],
      }
      const result = strategy.validate('access', 'refresh', profile)
      expect(result).toEqual({
        provider: 'github',
        providerId: '12345',
        avatarUrl: 'https://avatars.github.com/12345',
      })
    })

    it('photos가 없으면 avatarUrl이 undefined이다', () => {
      const profile = { id: 67890 }
      const result = strategy.validate('access', 'refresh', profile)
      expect(result).toEqual({
        provider: 'github',
        providerId: '67890',
        avatarUrl: undefined,
      })
    })

    it('숫자 id를 문자열로 변환한다', () => {
      const profile = { id: 99999, photos: [] }
      const result = strategy.validate('access', 'refresh', profile)
      expect(result.providerId).toBe('99999')
    })
  })
})
