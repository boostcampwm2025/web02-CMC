import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { v7 as uuidv7 } from 'uuid'
import { OAuthProfile, User } from '../types/oauth.types'
import { TokenService } from './token.service'
import { OAuthUserResponseDto } from '../dto/oauthUserResponse.dto'
import { PrismaService } from '../../prisma/prisma.service'
import { isGuestNicknamePattern } from '../../battles/service/utils/nickname.util'

@Injectable()
export class OauthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  private toUser(payload: { id: string; nickname: string; avatarUrl: string | null; provider: string; providerId: string }): User {
    return {
      id: payload.id,
      provider: payload.provider as User['provider'],
      providerId: payload.providerId,
      nickname: payload.nickname,
      avatarUrl: payload.avatarUrl ?? undefined,
    }
  }

  async findOrCreateUser(p: OAuthProfile): Promise<User> {
    const existingOAuth = await this.prisma.oAuth.findFirst({
      where: { provider: p.provider, code: p.providerId },
      include: { user: true },
    })

    if (existingOAuth) {
      return this.toUser({
        id: existingOAuth.user.id,
        nickname: existingOAuth.user.nickname,
        avatarUrl: existingOAuth.user.avatarUrl,
        provider: existingOAuth.provider,
        providerId: existingOAuth.code,
      })
    }

    const nickname = 'anonymous'
    const userId = uuidv7()
    const oauthId = uuidv7()

    const created = await this.prisma.$transaction(async prisma => {
      const user = await prisma.user.create({
        data: {
          id: userId,
          nickname,
          tier: 'UNRANKED',
          rating: 0,
          avatarUrl: p.avatarUrl ?? null,
        },
      })

      const oauth = await prisma.oAuth.create({
        data: {
          id: oauthId,
          userId,
          provider: p.provider,
          code: p.providerId,
        },
      })

      return { user, oauth }
    })

    return this.toUser({
      id: created.user.id,
      nickname: created.user.nickname,
      avatarUrl: created.user.avatarUrl,
      provider: created.oauth.provider,
      providerId: created.oauth.code,
    })
  }

  async loginWithGithub(profile: OAuthProfile): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const loginUser = await this.findOrCreateUser(profile)
    const { accessToken, refreshToken } = this.tokenService.generateTokens(loginUser.id)

    return {
      accessToken,
      refreshToken,
    }
  }

  async loginWithKakao(profile: OAuthProfile): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const loginUser = await this.findOrCreateUser(profile)
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

  async updateUserNickname(userId: string, nickname: string): Promise<OAuthUserResponseDto> {
    // 비회원 닉네임 패턴과 겹치지 않는지 확인
    if (isGuestNicknamePattern(nickname)) {
      throw new BadRequestException('다른 닉네임을 사용해주세요.')
    }

    const oauth = await this.prisma.oAuth.findFirst({ where: { userId } })
    if (!oauth) throw new NotFoundException('사용자를 찾을 수 없습니다.')

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { nickname },
    })

    return OAuthUserResponseDto.of(
      this.toUser({
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        provider: oauth.provider,
        providerId: oauth.code,
      }),
    )
  }
  /**
   * ID로 사용자 조회
   */
  async findUserById(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.')

    const oauth = await this.prisma.oAuth.findFirst({ where: { userId } })
    if (!oauth) throw new NotFoundException('사용자를 찾을 수 없습니다.')

    return this.toUser({
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      provider: oauth.provider,
      providerId: oauth.code,
    })
  }

  /**
   * 닉네임이 OAuth 사용자 중에 존재하는지 확인
   */
  async isNicknameExists(nickname: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { nickname },
      select: { id: true },
    })
    return Boolean(user)
  }
}
