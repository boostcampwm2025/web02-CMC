import fetchPostGuestLogin from '@/commons/apis/postGuestLogin';
import getOAuthUser from '@/commons/apis/getOAuthUser';
import logoutApi from '@/commons/apis/postLogout';
import { create } from 'zustand';
import type { AuthUser } from '@/commons/types/AuthUser';

interface AuthStore {
  user: AuthUser | null;
  isLoggingIn: boolean;

  loginGuest: (battleId: string, selectedTeam?: 'A' | 'B') => Promise<{ id: string; nickname: string }>;
  getOAuthUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  updateGuestTeam: (selectedTeam: 'A' | 'B') => void;
}

const OAUTH_KEY = 'CMC_OAUTH_USER';
const GUEST_KEY = 'CMC_GUEST_USER';

const getInitialUser = (): AuthUser | null => {
  try {
    // OAuth 유저 확인
    const oauthStored = localStorage.getItem(OAUTH_KEY);
    if (oauthStored) {
      return JSON.parse(oauthStored) as AuthUser;
    }

    // 비회원 유저 확인 (URL battleId와 비교)
    const pathMatch = window.location.pathname.match(/\/battle\/([^/]+)/);
    if (pathMatch) {
      const currentBattleId = pathMatch[1];
      const guestStored = localStorage.getItem(GUEST_KEY);

      if (guestStored) {
        const guestUser = JSON.parse(guestStored) as AuthUser;
        if (guestUser.battleId === currentBattleId) {
          return guestUser;
        }
      }
    }
  } catch (error: Error | unknown) {
    if (error instanceof Error) throw new Error('사용자 정보 로드 실패', error);
  }
  return null;
};

export const useAuthStore = create<AuthStore>((set, get) => {
  return {
    user: getInitialUser(),
    isLoggingIn: false,

    loginGuest: async (battleId, selectedTeam) => {
      set({ isLoggingIn: true });

      try {
        const data = await fetchPostGuestLogin(battleId);

        const user: AuthUser = {
          id: data.id,
          nickname: data.nickname,
          type: 'guest' as const,
          battleId,
          selectedTeam
        };
        localStorage.setItem(GUEST_KEY, JSON.stringify(user));
        set({
          user,
          isLoggingIn: false
        });

        const { default: Sentry } = await import('@sentry/react');
        Sentry.setUser({
          id: user.id,
          username: user.nickname,
          type: 'guest'
        });

        return user;
      } catch (e) {
        set({ isLoggingIn: false });
        throw e;
      }
    },

    updateGuestTeam: (selectedTeam) => {
      const currentUser = get().user;
      if (currentUser?.type === 'guest') {
        const updatedUser = { ...currentUser, selectedTeam };
        localStorage.setItem(GUEST_KEY, JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
    },

    getOAuthUser: async () => {
      const currentUser = get().user;
      if (currentUser?.type === 'oauth') {
        return currentUser;
      }

      // 비회원 상태면 OAuth 체크 안 함
      if (currentUser?.type === 'guest') {
        return null;
      }

      try {
        const oauthUser = await getOAuthUser();

        set({ user: oauthUser });

        const { default: Sentry } = await import('@sentry/react');
        Sentry.setUser({
          id: oauthUser.id,
          username: oauthUser.nickname,
          provider: oauthUser.provider,
          type: 'oauth'
        });

        localStorage.setItem(
          OAUTH_KEY,
          JSON.stringify({
            id: oauthUser.id,
            nickname: oauthUser.nickname
          })
        );

        return oauthUser;
      } catch {
        localStorage.removeItem(OAUTH_KEY);
        set({ user: null });
        return null;
      }
    },

    logout: async () => {
      try {
        if (get().user?.type === 'oauth') {
          await logoutApi();
        }
        get().clearAuth();

        // Sentry 사용자 정보 제거
        const { default: Sentry } = await import('@sentry/react');
        Sentry.setUser(null);
      } catch {
        throw new Error('로그아웃 실패');
      }
    },

    clearAuth: () => {
      localStorage.removeItem(OAUTH_KEY);
      localStorage.removeItem(GUEST_KEY);
      set({ user: null });
    }
  };
});

export const selectUser = (state: AuthStore) => state.user;
export const selectIsLoggingIn = (state: AuthStore) => state.isLoggingIn;
export const selectIsAuthenticated = (state: AuthStore) => state.user !== null;
export const selectIsGuest = (state: AuthStore) => state.user?.type === 'guest';
export const selectIsOAuth = (state: AuthStore) => state.user?.type === 'oauth';
