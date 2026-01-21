import type { AuthUser } from '@/commons/types/AuthUser';
import refreshToken from './postRefreshToken';

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

  // 401 에러 시 refresh token으로 재시도
  if (response.status === 401) {
    try {
      await refreshToken();
      // refresh 성공 후 재시도
      const retryResponse = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (!retryResponse.ok) {
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }

      const retryData = (await retryResponse.json()) as OAuthUserResponse;

      const user: AuthUser = {
        id: retryData.id,
        nickname: retryData.nickname,
        type: 'oauth',
        avatarUrl: retryData.avatarUrl
      };

      return user;
    } catch (error) {
      // refresh 실패 시 (refresh_token이 없거나 만료된 경우) 에러 던짐
      console.error('사용자 정보를 가져오는데 실패했습니다.', error);
    }
  }

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
