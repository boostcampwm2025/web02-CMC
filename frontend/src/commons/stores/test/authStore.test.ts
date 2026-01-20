import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';

// API 모킹
vi.mock('../../apis/getOAuthUser', () => ({
  default: vi.fn()
}));

vi.mock('../../apis/postGuestLogin', () => ({
  default: vi.fn()
}));

vi.mock('../../apis/postLogout', () => ({
  default: vi.fn()
}));

import getOAuthUser from '../../apis/getOAuthUser';
import fetchPostGuestLogin from '../../apis/postGuestLogin';
import logoutApi from '../../apis/postLogout';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
  });

  describe('loginGuest', () => {
    it('비회원 로그인 성공 시 store와 localStorage에 저장한다', async () => {
      const mockGuestData = {
        id: 'guest-123',
        nickname: '테스트유저'
      };

      vi.mocked(fetchPostGuestLogin).mockResolvedValue(mockGuestData);

      const result = await useAuthStore.getState().loginGuest('battle-1', '테스트유저');

      expect(result).toEqual(mockGuestData);
      expect(useAuthStore.getState().user).toEqual({
        id: 'guest-123',
        nickname: '테스트유저',
        type: 'guest'
      });
      expect(localStorage.getItem('CMC_BATTLE_USER')).toBe(JSON.stringify({ id: 'guest-123', nickname: '테스트유저' }));
    });

    it('닉네임이 8글자를 초과하면 에러를 던진다', async () => {
      await expect(useAuthStore.getState().loginGuest('battle-1', '123456789')).rejects.toThrow(
        '닉네임을 8글자까지 가능합니다.'
      );
    });

    it('닉네임 앞뒤 공백을 제거한다', async () => {
      const mockGuestData = {
        id: 'guest-123',
        nickname: '테스트유저'
      };

      vi.mocked(fetchPostGuestLogin).mockResolvedValue(mockGuestData);

      await useAuthStore.getState().loginGuest('battle-1', '  테스트유저  ');

      expect(vi.mocked(fetchPostGuestLogin)).toHaveBeenCalledWith('battle-1', '테스트유저');
    });

    it('로그인 실패 시 isLoggingIn을 false로 설정한다', async () => {
      vi.mocked(fetchPostGuestLogin).mockRejectedValue(new Error('로그인 실패'));

      await expect(useAuthStore.getState().loginGuest('battle-1', '테스트유저')).rejects.toThrow();

      expect(useAuthStore.getState().isLoggingIn).toBe(false);
    });
  });

  describe('getOAuthUser', () => {
    it('OAuth 사용자 정보를 가져와서 store와 localStorage에 저장한다', async () => {
      const mockOAuthUser = {
        id: 'oauth-123',
        nickname: 'OAuth유저',
        type: 'oauth' as const,
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      vi.mocked(getOAuthUser).mockResolvedValue(mockOAuthUser);

      const result = await useAuthStore.getState().getOAuthUser();

      expect(result).toEqual(mockOAuthUser);
      expect(useAuthStore.getState().user).toEqual(mockOAuthUser);
      expect(localStorage.getItem('CMC_BATTLE_USER')).toBe(JSON.stringify({ id: 'oauth-123', nickname: 'OAuth유저' }));
    });

    it('이미 OAuth 사용자가 로그인되어 있으면 API 호출 없이 반환한다', async () => {
      const mockOAuthUser = {
        id: 'oauth-123',
        nickname: 'OAuth유저',
        type: 'oauth' as const,
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      vi.mocked(getOAuthUser).mockResolvedValue(mockOAuthUser);

      // 첫 번째 호출
      await useAuthStore.getState().getOAuthUser();
      vi.mocked(getOAuthUser).mockClear();

      // 두 번째 호출 - API 호출 없이 반환해야 함
      const result = await useAuthStore.getState().getOAuthUser();

      expect(result).toEqual(mockOAuthUser);
      expect(vi.mocked(getOAuthUser)).not.toHaveBeenCalled();
    });

    it('API 호출 실패 시 에러를 던진다', async () => {
      vi.mocked(getOAuthUser).mockRejectedValue(new Error('401 Unauthorized'));

      await expect(useAuthStore.getState().getOAuthUser()).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('OAuth 사용자 로그아웃 시 API 호출 후 clearAuth를 호출한다', async () => {
      const mockOAuthUser = {
        id: 'oauth-123',
        nickname: 'OAuth유저',
        type: 'oauth' as const,
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      vi.mocked(getOAuthUser).mockResolvedValue(mockOAuthUser);
      vi.mocked(logoutApi).mockResolvedValue({ success: true });

      await useAuthStore.getState().getOAuthUser();
      await useAuthStore.getState().logout();

      expect(vi.mocked(logoutApi)).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorage.getItem('CMC_BATTLE_USER')).toBeNull();
    });

    it('비회원 로그아웃 시 API 호출 없이 clearAuth만 호출한다', async () => {
      const mockGuestData = {
        id: 'guest-123',
        nickname: '테스트유저'
      };

      vi.mocked(fetchPostGuestLogin).mockResolvedValue(mockGuestData);
      await useAuthStore.getState().loginGuest('battle-1', '테스트유저');

      // logoutApi 모킹 초기화
      vi.mocked(logoutApi).mockClear();

      await useAuthStore.getState().logout();

      expect(vi.mocked(logoutApi)).not.toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorage.getItem('CMC_BATTLE_USER')).toBeNull();
    });

    it('로그아웃 API 실패 시에도 clearAuth를 호출한다', async () => {
      const mockOAuthUser = {
        id: 'oauth-123',
        nickname: 'OAuth유저',
        type: 'oauth' as const,
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      vi.mocked(getOAuthUser).mockResolvedValue(mockOAuthUser);
      vi.mocked(logoutApi).mockRejectedValue(new Error('로그아웃 실패'));

      await useAuthStore.getState().getOAuthUser();
      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorage.getItem('CMC_BATTLE_USER')).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('store의 user를 null로 설정하고 localStorage를 삭제한다', () => {
      localStorage.setItem('CMC_BATTLE_USER', JSON.stringify({ id: 'test', nickname: 'test' }));
      useAuthStore.setState({ user: { id: 'test', nickname: 'test', type: 'guest' } });

      useAuthStore.getState().clearAuth();

      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorage.getItem('CMC_BATTLE_USER')).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectUser는 현재 user를 반환한다', () => {
      const user = { id: 'test', nickname: 'test', type: 'guest' as const };
      useAuthStore.setState({ user });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
    });

    it('selectIsAuthenticated는 user가 있으면 true를 반환한다', () => {
      useAuthStore.setState({ user: { id: 'test', nickname: 'test', type: 'guest' } });
      const state = useAuthStore.getState();
      expect(state.user !== null).toBe(true);

      useAuthStore.setState({ user: null });
      const state2 = useAuthStore.getState();
      expect(state2.user !== null).toBe(false);
    });

    it('selectIsGuest는 user type이 guest면 true를 반환한다', () => {
      useAuthStore.setState({ user: { id: 'test', nickname: 'test', type: 'guest' } });
      const state = useAuthStore.getState();
      expect(state.user?.type === 'guest').toBe(true);

      useAuthStore.setState({ user: { id: 'test', nickname: 'test', type: 'oauth' } });
      const state2 = useAuthStore.getState();
      expect(state2.user?.type === 'guest').toBe(false);
    });

    it('selectIsOAuth는 user type이 oauth면 true를 반환한다', () => {
      useAuthStore.setState({ user: { id: 'test', nickname: 'test', type: 'oauth' } });
      const state = useAuthStore.getState();
      expect(state.user?.type === 'oauth').toBe(true);

      useAuthStore.setState({ user: { id: 'test', nickname: 'test', type: 'guest' } });
      const state2 = useAuthStore.getState();
      expect(state2.user?.type === 'oauth').toBe(false);
    });
  });
});
