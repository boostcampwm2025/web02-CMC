import { User } from '../types/oauth.types'

export class OAuthUserResponseDto {
  id: string
  nickname: string
  avatarUrl: string
  tier: string
  rating: number

  static fromEntity(payload: User): OAuthUserResponseDto {
    const res = new OAuthUserResponseDto()
    const { id, nickname, avatarUrl, tier, rating } = payload
    res.id = id
    res.nickname = nickname
    res.avatarUrl = avatarUrl || ''
    res.tier = tier
    res.rating = rating
    return res
  }

  static of(payload: User): OAuthUserResponseDto {
    return OAuthUserResponseDto.fromEntity(payload)
  }
}
