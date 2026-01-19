import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github2'
import { ConfigService } from '@nestjs/config'
import { OAuthProfile } from '../types/oauth.types'

interface GithubProfile {
  id: string | number
  displayName?: string
  username?: string
  photos?: Array<{ value: string }>
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: config.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:3000/auth/github/callback',
      scope: ['user:email', 'read:user'],
    })
  }

  validate(_accessToken: string, _refreshToken: string, profile: GithubProfile): OAuthProfile {
    const nickname = profile.displayName || profile.username || 'Unknown'
    const avatarUrl = profile?.photos?.[0]?.value
    console.log(profile)
    return {
      provider: 'github',
      providerId: String(profile.id),
      nickname,
      avatarUrl,
    }
  }
}
