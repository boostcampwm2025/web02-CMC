import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-kakao'
import { ConfigService } from '@nestjs/config'
import { OAuthProfile } from '../types/oauth.types'

interface KakaoProfile {
  id: string | number
  username?: string
  displayName?: string
  _json?: {
    kakao_account?: {
      profile?: {
        nickname?: string
        profile_image_url?: string
      }
    }
    properties?: {
      nickname?: string
      profile_image?: string
    }
  }
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly config: ConfigService) {
    super({
      clientID: config.get<string>('KAKAO_CLIENT_ID') || '',
      clientSecret: config.get<string>('KAKAO_CLIENT_SECRET') || '',
      callbackURL: config.get<string>('KAKAO_CALLBACK_URL') || 'http://localhost:3000/auth/kakao/callback',
    })
  }

  validate(_accessToken: string, _refreshToken: string, profile: KakaoProfile): OAuthProfile {
    const json = profile._json
    const nickname = json?.kakao_account?.profile?.nickname || json?.properties?.nickname || profile.displayName || profile.username || 'Unknown'
    const avatarUrl = json?.kakao_account?.profile?.profile_image_url || json?.properties?.profile_image

    console.log(profile)

    return {
      provider: 'kakao',
      providerId: String(profile.id),
      nickname,
      avatarUrl,
    }
  }
}
