import fetchPostGuestLogin from '@/commons/apis/postGuestLogin';
import getOAuthUser from '@/commons/apis/getOAuthUser';
import logoutApi from '@/commons/apis/postLogout';
import { create } from 'zustand';
import type { AuthUser } from '@/commons/types/AuthUser';

interface AuthStore {
  user: AuthUser | null;
  isLoggingIn: boolean;

  loginGuest: (battleId: string, nickname: string) => Promise<{ id: string; nickname: string }>;
  getOAuthUser: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

const AUTH_KEY = 'CMC_BATTLE_USER';

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const isLoggedInCookie = (): boolean => {
  const cookie = getCookie('isLoggedIn');
  return cookie === 'true';
};

export const useAuthStore = create<AuthStore>((set, get) => {
  // 초기 사용자 로드: localStorage에서 id, nickname만 로드
  const loadInitialUser = (): AuthUser | null => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (!stored) return null;
      const data = JSON.parse(stored);

      // localStorage에는 id, nickname만 저장
      const user: AuthUser = {
        id: data.id,
        nickname: data.nickname,
        type: isLoggedInCookie() ? 'oauth' : 'guest' // 쿠키로 타입 구분
      };

      return user;
    } catch {
      return null;
    }
  };

  return {
    user: loadInitialUser(),
    isLoggingIn: false,

    loginGuest: async (battleId, nickname) => {
      set({ isLoggingIn: true });
      const trimmedNickname = nickname.trim();

      try {
        if (trimmedNickname.length > 8) {
          throw new Error('닉네임을 8글자까지 가능합니다.');
        }

        const data = await fetchPostGuestLogin(battleId, nickname);

        const user = {
          id: data.id,
          nickname: data.nickname
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        set({
          user: { ...user, type: 'guest' as const },
          isLoggingIn: false
        });

        return user;
      } catch (e) {
        set({ isLoggingIn: false });
        throw e;
      }
    },

    getOAuthUser: async () => {
      const currentUser = get().user;
      if (currentUser?.type === 'oauth') {
        return currentUser;
      }

      if (!isLoggedInCookie()) {
        throw new Error('OAuth 인증이 필요합니다.');
      }

      const oauthUser = await getOAuthUser();
      if (!oauthUser) {
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }

      // localStorage에는 id, nickname만 저장
      localStorage.setItem(
        AUTH_KEY,
        JSON.stringify({
          id: oauthUser.id,
          nickname: oauthUser.nickname
        })
      );

      set({ user: oauthUser });
      return oauthUser;
    },

    logout: async () => {
      try {
        if (get().user?.type === 'oauth') {
          await logoutApi();
        }
        get().clearAuth();
      } catch (e) {
        get().clearAuth();
        console.error('로그아웃 실패:', e);
      }
    },

    clearAuth: () => {
      localStorage.removeItem(AUTH_KEY);
      set({ user: null });
    }
  };
});

export const selectUser = (state: AuthStore) => state.user;
export const selectIsLoggingIn = (state: AuthStore) => state.isLoggingIn;
export const selectIsAuthenticated = (state: AuthStore) => state.user !== null;
export const selectIsGuest = (state: AuthStore) => state.user?.type === 'guest';
export const selectIsOAuth = (state: AuthStore) => state.user?.type === 'oauth';
