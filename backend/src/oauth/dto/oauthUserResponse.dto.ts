import { User } from '../types/oauth.types'

export class OAuthUserResponseDto {
  id: string
  nickname: string
  avatarUrl: string

  static fromEntity(payload: User): OAuthUserResponseDto {
    const res = new OAuthUserResponseDto()
    const { id, nickname, avatarUrl } = payload
    res.id = id
    res.nickname = nickname
    res.avatarUrl = avatarUrl || ''
    return res
  }

  static of(payload: User): OAuthUserResponseDto {
    return OAuthUserResponseDto.fromEntity(payload)
  }
}
