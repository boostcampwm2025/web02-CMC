import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BattleCreatePage from './index';
import * as postCreateBattleApi from './api/createBattle';
import * as formatCodeUtil from '@/commons/utils/codeFormatter';
import { renderWithProviders } from '@/test/testUtils';

vi.mock('./api/createBattle');
vi.mock('@/commons/utils/codeFormatter');
vi.mock('@/commons/stores/authStore', () => ({
  useAuthStore: vi.fn((selector: any) => {
    const mockUser = {
      id: 'test-user-id',
      nickname: 'testuser',
      avatarUrl: null,
      type: 'oauth' as const
    };
    if (selector) {
      return selector({ user: mockUser });
    }
    return mockUser;
  }),
  selectUser: vi.fn((state: any) => state.user)
}));
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('BattleCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(formatCodeUtil.formatCode).mockResolvedValue({ code: 'formatted code', formatted: true });
  });

  it('배틀 생성 페이지가 올바르게 렌더링된다', () => {
    renderWithProviders(<BattleCreatePage />);

    expect(screen.getByText('새 배틀 생성')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/예: 배열에서 중복 제거하기/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/어떤 코드를 비교하고 싶으신가요?/i)).toBeInTheDocument();
  });

  it('배틀 생성 성공 시 team-select로 리다이렉트된다', async () => {
    const user = userEvent.setup({ delay: null });
    vi.mocked(postCreateBattleApi.default).mockResolvedValue({
      battleId: 'test-battle-id',
      inviteCode: 'test-invite-code'
    });

    renderWithProviders(<BattleCreatePage />);

    await user.type(screen.getByPlaceholderText(/예: 배열에서 중복 제거하기/i), 'Test Battle');
    await user.type(screen.getByPlaceholderText(/어떤 코드를 비교하고 싶으신가요?/i), 'Test Description');
    await user.type(screen.getByPlaceholderText(/첫 번째 코드/i), 'code A');
    await user.type(screen.getByPlaceholderText(/두 번째 코드/i), 'code B');

    const topicCheckbox = screen.getByLabelText(/효율성/i);
    await user.click(topicCheckbox);

    await user.click(screen.getByTestId('create-battle-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/battle/test-battle-id/team-select/');
    });
  });
});
