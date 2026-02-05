import { KakaoStrategy } from './kakao.strategy'
import type { ConfigService } from '@nestjs/config'

describe('KakaoStrategy', () => {
  let strategy: KakaoStrategy

  beforeEach(() => {
    const configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          KAKAO_CLIENT_ID: 'test-kakao-id',
          KAKAO_CLIENT_SECRET: 'test-kakao-secret',
          KAKAO_CALLBACK_URL: 'http://localhost:3000/auth/kakao/callback',
        }
        return config[key]
      }),
    } as unknown as ConfigService
    strategy = new KakaoStrategy(configService)
  })

  describe('validate', () => {
    it('Kakao 프로필에서 kakao_account 이미지를 추출한다', () => {
      const profile = {
        id: '11111',
        _json: {
          kakao_account: {
            profile: {
              profile_image_url: 'https://k.kakao.com/avatar.png',
            },
          },
        },
      }
      const result = strategy.validate('access', 'refresh', profile)
      expect(result).toEqual({
        provider: 'kakao',
        providerId: '11111',
        avatarUrl: 'https://k.kakao.com/avatar.png',
      })
    })

    it('kakao_account가 없으면 properties에서 이미지를 추출한다', () => {
      const profile = {
        id: '22222',
        _json: {
          properties: {
            profile_image: 'https://k.kakao.com/prop-avatar.png',
          },
        },
      }
      const result = strategy.validate('access', 'refresh', profile)
      expect(result).toEqual({
        provider: 'kakao',
        providerId: '22222',
        avatarUrl: 'https://k.kakao.com/prop-avatar.png',
      })
    })

    it('이미지가 없으면 avatarUrl이 undefined이다', () => {
      const profile = { id: 33333, _json: {} }
      const result = strategy.validate('access', 'refresh', profile)
      expect(result).toEqual({
        provider: 'kakao',
        providerId: '33333',
        avatarUrl: undefined,
      })
    })

    it('_json이 없어도 에러 없이 처리한다', () => {
      const profile = { id: 44444 }
      const result = strategy.validate('access', 'refresh', profile)
      expect(result.provider).toBe('kakao')
      expect(result.providerId).toBe('44444')
    })
  })
})
