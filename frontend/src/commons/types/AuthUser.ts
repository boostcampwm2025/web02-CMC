export type UserType = 'guest' | 'oauth';

export interface AuthUser {
  id: string;
  nickname: string;
  type: UserType;
  provider?: 'github' | 'kakao';
  avatarUrl?: string;
  tier?: string;
  rating?: number;
  battleId?: string;
  selectedTeam?: 'A' | 'B';
  provider?: 'GITHUB' | 'KAKAO';
}
