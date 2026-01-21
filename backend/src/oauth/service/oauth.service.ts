import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { OAuthProfile, User } from '../types/oauth.types'
import { TokenService } from './token.service'
import { OAuthUserResponseDto } from '../dto/oauthUserResponse.dto'
import { isGuestNicknamePattern } from '../../battles/service/utils/nickname.util'

@Injectable()
export class OauthService {
  constructor(private readonly tokenService: TokenService) {}

  private readonly oauthMap = new Map<string, User>()

  findOrCreateUser(p: OAuthProfile): User {
    const key = `${p.provider}-${p.providerId}`
    const initialNickname = 'anonymous'

    const existed = this.oauthMap.get(key)
    if (existed) {
      return existed
    }

    const newuUser: User = {
      id: crypto.randomUUID(),
      provider: p.provider,
      providerId: p.providerId,
      nickname: initialNickname,
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

    return {
      accessToken,
      refreshToken,
    }
  }

  loginWithKakao(profile: OAuthProfile): {
    accessToken: string
    refreshToken: string
  } {
    const loginUser = this.findOrCreateUser(profile)
    const { accessToken, refreshToken } = this.tokenService.generateTokens(loginUser.id)

    return {
      accessToken,
      refreshToken,
    }
  }

  refreshToken(refreshToken: string): {
    accessToken: string
    refreshToken: string
  } {
    const { accessToken, refreshToken: newRefreshToken } = this.tokenService.refresh(refreshToken)
    return { accessToken, refreshToken: newRefreshToken }
  }

  updateUserNickname(userId: string, nickname: string): OAuthUserResponseDto {
    // 비회원 닉네임 패턴과 겹치지 않는지 확인
    if (isGuestNicknamePattern(nickname)) {
      throw new BadRequestException('다른 닉네임을 사용해주세요.')
    }

    const user = this.findUserById(userId)
    user.nickname = nickname
    return OAuthUserResponseDto.of(user)
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

  /**
   * 닉네임이 OAuth 사용자 중에 존재하는지 확인
   */
  isNicknameExists(nickname: string): boolean {
    return Array.from(this.oauthMap.values()).some(user => user.nickname === nickname)
  }
}
