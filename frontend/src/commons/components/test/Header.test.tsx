import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { useAuthStore, selectUser, selectIsOAuth } from '@/commons/stores/authStore';

// authStore 모킹
vi.mock('@/commons/stores/authStore', async () => {
  const actual = await vi.importActual('@/commons/stores/authStore');
  return {
    ...actual,
    useAuthStore: vi.fn()
  };
});

// UserProfileDropdown 모킹
vi.mock('../UserProfileDropdown', () => ({
  default: ({ user }: { user: { id: string; nickname: string; avatarUrl?: string } }) => (
    <div data-testid="user-profile-dropdown">{user.nickname}</div>
  )
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로고와 타이틀이 렌더링된다', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (selector === selectUser) return null;
      if (selector === selectIsOAuth) return false;
      return null;
    });

    renderHeader();

    expect(screen.getByText('배틀 아레나')).toBeInTheDocument();
  });

  it('비로그인 상태일 때 로그인/가입 버튼이 표시된다', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (selector === selectUser) return null;
      if (selector === selectIsOAuth) return false;
      return null;
    });

    renderHeader();

    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.getByText('가입하기')).toBeInTheDocument();
    expect(screen.queryByTestId('user-profile-dropdown')).not.toBeInTheDocument();
  });

  it('비회원 사용자일 때 로그인/가입 버튼이 표시된다', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (selector === selectUser) {
        return { id: 'guest-1', nickname: '게스트', type: 'guest' as const };
      }
      if (selector === selectIsOAuth) return false;
      return null;
    });

    renderHeader();

    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.getByText('가입하기')).toBeInTheDocument();
    expect(screen.queryByTestId('user-profile-dropdown')).not.toBeInTheDocument();
  });

  it('OAuth 사용자일 때 프로필 드롭다운이 표시된다', () => {
    const mockUser = {
      id: 'oauth-1',
      nickname: 'OAuth유저',
      type: 'oauth' as const,
      avatarUrl: 'https://example.com/avatar.jpg',
      tier: 'GOLD',
      rating: 520
    };

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (selector === selectUser) return mockUser;
      if (selector === selectIsOAuth) return true;
      return null;
    });

    renderHeader();

    expect(screen.getByTestId('user-profile-dropdown')).toBeInTheDocument();
    expect(screen.getByText('OAuth유저')).toBeInTheDocument();
    expect(screen.getByText('GOLD')).toBeInTheDocument();
    expect(screen.queryByText('로그인')).not.toBeInTheDocument();
    expect(screen.queryByText('가입하기')).not.toBeInTheDocument();
  });

  it('OAuth 사용자일 때 avatarUrl이 없어도 프로필 드롭다운이 표시된다', () => {
    const mockUser = {
      id: 'oauth-1',
      nickname: 'OAuth유저',
      type: 'oauth' as const,
      tier: 'BRONZE',
      rating: 10
    };

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (selector === selectUser) return mockUser;
      if (selector === selectIsOAuth) return true;
      return null;
    });

    renderHeader();

    expect(screen.getByTestId('user-profile-dropdown')).toBeInTheDocument();
    expect(screen.getByText('OAuth유저')).toBeInTheDocument();
    expect(screen.getByText('BRONZE')).toBeInTheDocument();
  });
});
