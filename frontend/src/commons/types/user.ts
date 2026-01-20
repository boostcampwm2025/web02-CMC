export interface User {
  id: string;
  nickname: string;
  email?: string;
  provider?: 'github' | 'kakao' | 'guest';
  avatarUrl?: string;
}
