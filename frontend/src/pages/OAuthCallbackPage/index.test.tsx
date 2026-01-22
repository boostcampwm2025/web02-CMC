import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OAuthCallbackPage from './index';
import { useAuthStore } from '@/commons/stores/authStore';

vi.mock('@/commons/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn()
  }
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('OAuthCallbackPage', () => {
  const createMockStore = (getOAuthUser: ReturnType<typeof vi.fn>) =>
    ({
      user: null,
      isLoggingIn: false,
      loginGuest: vi.fn(),
      getOAuthUser: getOAuthUser as () => Promise<import('@/commons/types/AuthUser').AuthUser | null>,
      logout: vi.fn(),
      clearAuth: vi.fn()
    }) as ReturnType<typeof useAuthStore.getState>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <OAuthCallbackPage />
      </BrowserRouter>
    );
  };

  it('로딩 메시지가 표시된다', () => {
    vi.mocked(useAuthStore.getState).mockReturnValue(createMockStore(vi.fn().mockResolvedValue(null)));

    renderWithRouter();

    expect(screen.getByText('로그인 처리중...')).toBeInTheDocument();
  });

  it('사용자 정보가 없으면 로그인 페이지로 리다이렉트한다', async () => {
    vi.mocked(useAuthStore.getState).mockReturnValue(createMockStore(vi.fn().mockResolvedValue(null)));

    renderWithRouter();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('OAuth 사용자이고 닉네임이 없으면 닉네임 페이지로 리다이렉트한다', async () => {
    const mockUser = {
      id: 'oauth-123',
      nickname: '',
      type: 'oauth' as const,
      avatarUrl: 'https://example.com/avatar.jpg'
    };

    vi.mocked(useAuthStore.getState).mockReturnValue(createMockStore(vi.fn().mockResolvedValue(mockUser)));

    renderWithRouter();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/nickname', { replace: true });
    });
  });

  it('OAuth 사용자이고 닉네임이 공백만 있으면 닉네임 페이지로 리다이렉트한다', async () => {
    const mockUser = {
      id: 'oauth-123',
      nickname: '   ',
      type: 'oauth' as const,
      avatarUrl: 'https://example.com/avatar.jpg'
    };

    vi.mocked(useAuthStore.getState).mockReturnValue(createMockStore(vi.fn().mockResolvedValue(mockUser)));

    renderWithRouter();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/nickname', { replace: true });
    });
  });

  it('OAuth 사용자이고 닉네임이 "anonymous"이면 닉네임 페이지로 리다이렉트한다', async () => {
    const mockUser = {
      id: 'oauth-123',
      nickname: 'anonymous',
      type: 'oauth' as const,
      avatarUrl: 'https://example.com/avatar.jpg'
    };

    vi.mocked(useAuthStore.getState).mockReturnValue(createMockStore(vi.fn().mockResolvedValue(mockUser)));

    renderWithRouter();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/nickname', { replace: true });
    });
  });

  it('OAuth 사용자이고 닉네임이 있으면 메인 페이지로 리다이렉트한다', async () => {
    const mockUser = {
      id: 'oauth-123',
      nickname: '테스트닉네임',
      type: 'oauth' as const,
      avatarUrl: 'https://example.com/avatar.jpg'
    };

    vi.mocked(useAuthStore.getState).mockReturnValue(createMockStore(vi.fn().mockResolvedValue(mockUser)));

    renderWithRouter();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
