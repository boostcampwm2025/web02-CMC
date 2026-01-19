import { Injectable, NotFoundException } from '@nestjs/common'
import { OAuthProfile, User } from '../types/oauth.types'
import { TokenService } from './token.service'

@Injectable()
export class OauthService {
  constructor(private readonly tokenService: TokenService) {}

  private readonly oauthMap = new Map<string, User>()

  private findOrCreateUser(p: OAuthProfile): User {
    const key = `${p.provider}-${p.providerId}`

    const existed = this.oauthMap.get(key)
    if (existed) {
      console.log('existed')
      return existed
    }

    const newuUser: User = {
      id: crypto.randomUUID(),
      provider: 'github',
      providerId: p.providerId,
      nickname: p.nickname,
      avatarUrl: p.avatarUrl,
    }

    this.oauthMap.set(key, newuUser)
    return newuUser
  }

  loginWithGithub(profile: OAuthProfile): {
    accessToken: string
    refreshToken: string
  } {
    const loginUser = this.findOrCreateUser(profile)
    const { accessToken, refreshToken } = this.tokenService.generateTokens(loginUser.id)

    console.log(loginUser)
    console.log(accessToken)
    console.log(refreshToken)

    return {
      accessToken,
      refreshToken,
    }
  }

  /**
   * ID로 사용자 조회
   */
  findUserById(userId: string): User {
    for (const user of this.oauthMap.values()) {
      if (user.id === userId) {
        return user
      }
    }
    throw new NotFoundException('사용자를 찾을 수 없습니다.')
  }
}
