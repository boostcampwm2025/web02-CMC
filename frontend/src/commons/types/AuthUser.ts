export type UserType = 'guest' | 'oauth';

export interface AuthUser {
  id: string;
  nickname: string;
  type: UserType;
  avatarUrl?: string;
  tier?: string;
  rating?: number;
  battleId?: string; // 비회원 로그인인 경우에만 존재
}
