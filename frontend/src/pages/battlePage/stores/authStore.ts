import fetchPostGuestLogin from '@/commons/apis/postGuestLogin';
import { create } from 'zustand';

interface AuthUser {
  id: string;
  nickname: string;
}

interface AuthStore {
  user: AuthUser | null;
  isLoggingIn: boolean;

  loginGuest: (battleId: string, nickname: string) => Promise<{ id: string; nickname: string }>;
  clearAuth: () => void;
}

const AUTH_KEY = 'CMC_BATTLE_USER';

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'),
  isLoggingIn: false,

  loginGuest: async (battleId, nickname) => {
    set({ isLoggingIn: true });

    try {
      const data = await fetchPostGuestLogin(battleId, nickname);

      const user = {
        id: data.id,
        nickname: data.nickname
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      set({ user, isLoggingIn: false });

      return user;
    } catch (e) {
      set({ isLoggingIn: false });
      throw e;
    }
  },

  clearAuth: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ user: null });
  }
}));

export const selectUser = (state: AuthStore) => state.user;
export const selectIsLogginIn = (state: AuthStore) => state.isLoggingIn;
