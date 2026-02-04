import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NicknamePage from './index';
import { useAuthStore } from '@/commons/stores/authStore';
import updateOAuthNickname from './apis/updateOAuthNickname';
import { renderWithProviders } from '@/test/testUtils';

// 모킹
const mockAddToast = vi.fn();

vi.mock('@/commons/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
    setState: vi.fn()
  }
}));

vi.mock('@/commons/stores/toastStore', () => ({
  useToastStore: vi.fn((selector: any) => {
    if (selector?.name === 'selectAddToast') {
      return mockAddToast;
    }
    return mockAddToast;
  }),
  selectAddToast: vi.fn((state: any) => state.addToast)
}));

vi.mock('./apis/updateOAuthNickname', () => ({
  default: vi.fn()
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('NicknamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(useAuthStore.getState).mockReturnValue({
      user: null,
      isLoggingIn: false,
      loginGuest: vi.fn(),
      getOAuthUser: vi.fn(),
      logout: vi.fn(),
      clearAuth: vi.fn(),
      updateGuestTeam: vi.fn()
    });
    vi.mocked(useAuthStore.setState).mockImplementation(() => {});
  });

  it('닉네임 페이지가 올바르게 렌더링된다', () => {
    renderWithProviders(<NicknamePage />);

    expect(screen.getByText('코문철')).toBeInTheDocument();
    expect(screen.getByText('닉네임 설정')).toBeInTheDocument();
    expect(screen.getByText('코문철에서 사용할 닉네임을 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('닉네임을 입력하세요 (최대 8자)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '시작하기' })).toBeInTheDocument();
  });

  it('닉네임 입력 필드에 값을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NicknamePage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (최대 8자)');
    await user.type(input, '테스트닉네임');

    expect(input).toHaveValue('테스트닉네임');
  });

  it('닉네임이 비어있으면 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NicknamePage />);

    const submitButton = screen.getByRole('button', { name: '시작하기' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('닉네임을 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('닉네임이 8글자를 초과하면 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NicknamePage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (최대 8자)') as HTMLInputElement;

    // maxLength를 임시로 제거하여 9글자 입력 가능하게 함
    input.removeAttribute('maxLength');
    await user.type(input, '123456789');

    const submitButton = screen.getByRole('button', { name: '시작하기' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('닉네임은 8글자까지 가능합니다.')).toBeInTheDocument();
    });
  });

  it('닉네임 앞뒤 공백을 제거하고 제출한다', async () => {
    const user = userEvent.setup();
    vi.mocked(updateOAuthNickname).mockResolvedValue();
    renderWithProviders(<NicknamePage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (최대 8자)');
    await user.type(input, '  테스트  ');

    const submitButton = screen.getByRole('button', { name: '시작하기' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateOAuthNickname).toHaveBeenCalledWith('테스트');
    });
  });

  it('닉네임 제출 성공 시 메인 페이지로 이동한다', async () => {
    const user = userEvent.setup();
    vi.mocked(updateOAuthNickname).mockResolvedValue();

    renderWithProviders(<NicknamePage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (최대 8자)');
    await user.type(input, '테스트닉네임');

    const submitButton = screen.getByRole('button', { name: '시작하기' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateOAuthNickname).toHaveBeenCalledWith('테스트닉네임');
      expect(useAuthStore.setState).toHaveBeenCalledWith({ user: null });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('닉네임 제출 중에는 버튼이 비활성화되고 로딩 텍스트가 표시된다', async () => {
    const user = userEvent.setup();
    vi.mocked(updateOAuthNickname).mockImplementation(() => new Promise(() => {})); // 무한 대기
    renderWithProviders(<NicknamePage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (최대 8자)');
    await user.type(input, '테스트닉네임');

    const submitButton = screen.getByRole('button', { name: '시작하기' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('설정 중...')).toBeInTheDocument();
    });
  });

  it('에러 후 다시 입력하면 로컬 에러가 사라진다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NicknamePage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (최대 8자)');
    const submitButton = screen.getByRole('button', { name: '시작하기' });

    // 빈 값으로 제출해서 로컬 에러 발생
    await user.click(submitButton);
    expect(screen.getByText('닉네임을 입력해주세요.')).toBeInTheDocument();

    // 입력하면 에러 사라짐
    await user.type(input, 'test');
    expect(screen.queryByText('닉네임을 입력해주세요.')).not.toBeInTheDocument();
  });

  it('입력 필드의 maxLength가 8로 설정되어 있다', () => {
    renderWithProviders(<NicknamePage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (최대 8자)');
    expect(input).toHaveAttribute('maxLength', '8');
  });
});
