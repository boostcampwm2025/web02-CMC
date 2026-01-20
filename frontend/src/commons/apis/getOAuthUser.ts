import type { AuthUser } from '@/commons/types/AuthUser';

interface OAuthUserResponse {
  id: string;
  provider: 'github' | 'kakao';
  providerId: string;
  nickname: string;
  avatarUrl?: string;
}

// getOAuthUser.ts
const getOAuthUser = async (): Promise<AuthUser> => {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('사용자 정보를 가져오는데 실패했습니다.');
  }

  const data = (await response.json()) as OAuthUserResponse;

  const user: AuthUser = {
    id: data.id,
    nickname: data.nickname,
    type: 'oauth',
    avatarUrl: data.avatarUrl
  };

  return user;
};
export default getOAuthUser;
