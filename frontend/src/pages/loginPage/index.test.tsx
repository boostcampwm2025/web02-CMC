import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './index';
import * as oauthApi from './api/oauth';

// OAuth API 모킹
vi.mock('./api/oauth', () => ({
  loginWithGitHub: vi.fn(),
  loginWithKakao: vi.fn()
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로그인 페이지가 올바르게 렌더링된다', () => {
    render(<LoginPage />);

    expect(screen.getByText('코문철')).toBeInTheDocument();
    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.getByText('소셜 계정으로 간편하게 시작하세요')).toBeInTheDocument();
  });

  it('GitHub 로그인 버튼이 렌더링된다', () => {
    render(<LoginPage />);

    const githubButton = screen.getByRole('button', { name: /GitHub로 계속하기/i });
    expect(githubButton).toBeInTheDocument();
  });

  it('Kakao 로그인 버튼이 렌더링된다', () => {
    render(<LoginPage />);

    const kakaoButton = screen.getByRole('button', { name: /카카오로 계속하기/i });
    expect(kakaoButton).toBeInTheDocument();
  });

  it('GitHub 로그인 버튼 클릭 시 loginWithGitHub가 호출된다', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const githubButton = screen.getByRole('button', { name: /GitHub로 계속하기/i });
    await user.click(githubButton);

    expect(oauthApi.loginWithGitHub).toHaveBeenCalledTimes(1);
  });

  it('Kakao 로그인 버튼 클릭 시 loginWithKakao가 호출된다', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const kakaoButton = screen.getByRole('button', { name: /카카오로 계속하기/i });
    await user.click(kakaoButton);

    expect(oauthApi.loginWithKakao).toHaveBeenCalledTimes(1);
  });

  it('안내 문구가 표시된다', () => {
    render(<LoginPage />);

    expect(screen.getByText(/로그인하면 코문철의 모든 기능을 이용할 수 있습니다/i)).toBeInTheDocument();
  });
});
