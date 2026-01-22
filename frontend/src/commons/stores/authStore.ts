import fetchPostGuestLogin from '@/commons/apis/postGuestLogin';
import getOAuthUser from '@/commons/apis/getOAuthUser';
import logoutApi from '@/commons/apis/postLogout';
import { create } from 'zustand';
import type { AuthUser } from '@/commons/types/AuthUser';

interface AuthStore {
  user: AuthUser | null;
  isLoggingIn: boolean;

  loginGuest: (battleId: string, nickname: string) => Promise<{ id: string; nickname: string }>;
  getOAuthUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

const AUTH_KEY = 'CMC_BATTLE_USER';

export const useAuthStore = create<AuthStore>((set, get) => {
  return {
    user: null,
    isLoggingIn: false,

    loginGuest: async (battleId, nickname) => {
      set({ isLoggingIn: true });
      const trimmedNickname = nickname.trim();

      try {
        if (trimmedNickname.length > 8) {
          throw new Error('닉네임을 8글자까지 가능합니다.');
        }

        const data = await fetchPostGuestLogin(battleId, trimmedNickname);

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

      try {
        const oauthUser = await getOAuthUser();

        // store에 저장
        set({ user: oauthUser });

        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            id: oauthUser.id,
            nickname: oauthUser.nickname
          })
        );

        return oauthUser;
      } catch {
        get().clearAuth();
        return null;
      }
    },

    logout: async () => {
      try {
        if (get().user?.type === 'oauth') {
          await logoutApi();
        }
        get().clearAuth();
      } catch {
        throw new Error('로그아웃 실패');
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
