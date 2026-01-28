import { OAuthProvider, User } from '../types/oauth.types'

type OAuthEntityLike = {
  provider: string
  code: string
}

type UserEntityLike = {
  id: string
  nickname: string
  avatarUrl: string | null
}

export class OAuthUserDto implements User {
  id: string
  provider: OAuthProvider
  providerId: string
  nickname: string
  avatarUrl?: string

  static fromEntity(payload: { user: UserEntityLike; oauth: OAuthEntityLike }): User {
    return {
      id: payload.user.id,
      provider: payload.oauth.provider as OAuthProvider,
      providerId: payload.oauth.code,
      nickname: payload.user.nickname,
      avatarUrl: payload.user.avatarUrl ?? undefined,
    }
  }
}
