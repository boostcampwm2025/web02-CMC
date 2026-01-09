import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiscussionInput from '@/pages/battlePage/components/discussion/DiscussionInput';

let mockBattleProgress: {
  phase: string;
} = {
  phase: 'ATTACK'
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
  selectBattleProgress: (state: { battleProgress: { phase: string } }) => state.battleProgress,
  selectSelectedTeam: (state: { selectedTeam: 'A' | 'B' }) => state.selectedTeam
}));

describe('DiscussionInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockBattleProgress = {
      phase: 'ATTACK'
    };
    mockSelectedTeam = 'A';
  });

  it('공격 팀일 때 "상대 진영에 이의제기..." placeholder 표시', () => {
    mockSelectedTeam = 'A';
    mockBattleProgress = { phase: 'ATTACK' };

    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('상대 진영에 이의제기...')).toBeInTheDocument();
    expect(screen.getByText('이의제기')).toBeInTheDocument();
  });

  it('방어 팀일 때 "상대 진영에 반론..." placeholder 표시', () => {
    mockSelectedTeam = 'A';
    mockBattleProgress = { phase: 'DEFENSE' };

    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('상대 진영에 반론...')).toBeInTheDocument();
    expect(screen.getByText('반론')).toBeInTheDocument();
  });

  it('버튼 클릭 시 제출', async () => {
    const user = userEvent.setup();
    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/상대 진영에/);
    await user.type(input, '버튼 클릭 테스트');

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('버튼 클릭 테스트');
  });

  it('제출 후 input 초기화', async () => {
    const user = userEvent.setup();
    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/상대 진영에/) as HTMLInputElement;
    await user.type(input, '초기화 테스트');
    await user.click(screen.getByRole('button'));

    expect(input.value).toBe('');
  });

  it('빈 문자열 제출 불가', async () => {
    const user = userEvent.setup();
    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/상대 진영에/);
    await user.type(input, '   {Enter}'); // 공백만 입력

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('OPINION_SHARE 단계에서 input 비활성화', () => {
    mockBattleProgress = { phase: 'OPINION_SHARE' };

    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('의견을 공유하세요...');
    expect(input).toBeDisabled();
  });

  it('ATTACK/DEFENSE 외 페이즈에서는 input 비활성화', () => {
    mockSelectedTeam = 'A';
    mockBattleProgress = { phase: 'TEAM_SWITCH' };

    render(<DiscussionInput onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/상대 진영에/);
    expect(input).toBeDisabled();
  });

  it('disabled prop이 true일 때 input 비활성화', () => {
    render(<DiscussionInput onSubmit={mockOnSubmit} disabled={true} />);

    const input = screen.getByPlaceholderText(/상대 진영에/);
    expect(input).toBeDisabled();
  });
});
