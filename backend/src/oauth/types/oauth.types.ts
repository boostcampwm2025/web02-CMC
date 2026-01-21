export type OAuthProvider = 'github' | 'kakao'

export interface OAuthProfile {
  provider: OAuthProvider
  providerId: string
  avatarUrl?: string
}

//사용자 정보
export interface User {
  id: string
  provider: OAuthProvider
  providerId: string
  nickname: string
  avatarUrl?: string
}
