import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiscussionInput from '@/pages/battlePage/components/discussion/DiscussionInput';

let mockBattleProgress: {
  phase: string;
  round?: number;
} = {
  phase: 'ATTACK',
  round: 1
};
let mockSelectedTeam: 'A' | 'B' = 'A';

vi.mock('@/pages/battlePage/stores/battleStore', () => ({
  useBattleStore: vi.fn((selector) => {
    const state = {
      battleProgress: mockBattleProgress,
      selectedTeam: mockSelectedTeam
    };
    return selector(state);
  }),
  selectBattleProgress: (state: { battleProgress: { phase: string; round?: number } }) => state.battleProgress,
  selectSelectedTeam: (state: { selectedTeam: 'A' | 'B' }) => state.selectedTeam
}));

describe('DiscussionInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockBattleProgress = {
      phase: 'ATTACK',
      round: 1
    };
    mockSelectedTeam = 'A';
  });

  it('공격 팀일 때 올바른 placeholder와 라벨 표시', () => {
    mockSelectedTeam = 'A';
    mockBattleProgress = { phase: 'ATTACK', round: 1 };

    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('상대 코드의 허점을 찾아 이의 제기하세요')).toBeInTheDocument();
    expect(screen.getByText('1R 이의제기')).toBeInTheDocument();
    expect(screen.getByText('이의제기')).toBeInTheDocument();
  });

  it('방어 팀일 때 올바른 placeholder와 라벨 표시', () => {
    mockSelectedTeam = 'A';
    mockBattleProgress = { phase: 'DEFENSE', round: 1 };

    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('상대 주장에 논리적으로 반박해 보세요')).toBeInTheDocument();
    expect(screen.getByText('1R 반론')).toBeInTheDocument();
    expect(screen.getByText('반론')).toBeInTheDocument();
  });

  it('버튼 클릭 시 제출', async () => {
    const user = userEvent.setup();
    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('상대 코드의 허점을 찾아 이의 제기하세요');
    await user.type(input, '버튼 클릭 테스트');

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('버튼 클릭 테스트');
  });

  it('제출 후 input 초기화', async () => {
    const user = userEvent.setup();
    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('상대 코드의 허점을 찾아 이의 제기하세요') as HTMLInputElement;
    await user.type(input, '초기화 테스트');
    await user.click(screen.getByRole('button'));

    expect(input.value).toBe('');
  });

  it('빈 문자열 제출 불가', async () => {
    const user = userEvent.setup();
    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('상대 코드의 허점을 찾아 이의 제기하세요');
    await user.type(input, '   {Enter}'); // 공백만 입력

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('OPINION_SHARE 단계에서 컴포넌트가 렌더링되지 않음', () => {
    mockBattleProgress = { phase: 'OPINION_SHARE', round: 1 };

    const { container } = render(<DiscussionInput onSubmit={mockOnSubmit} />);

    expect(container.firstChild).toBeNull();
  });

  it('ATTACK/DEFENSE 외 페이즈에서는 컴포넌트가 렌더링되지 않음', () => {
    mockSelectedTeam = 'A';
    mockBattleProgress = { phase: 'TEAM_SWITCH', round: 1 };

    const { container } = render(<DiscussionInput onSubmit={mockOnSubmit} />);

    expect(container.firstChild).toBeNull();
  });

  it('라운드 번호가 라벨에 표시됨', () => {
    mockBattleProgress = { phase: 'ATTACK', round: 2 };
    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    expect(screen.getByText(/2R/)).toBeInTheDocument();
  });
});
