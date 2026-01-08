import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DiscussionVote from '@/pages/battlePage/components/discussion/DiscussionVote';
import type { Discussion } from '@/pages/battlePage/components/discussion/DiscussionVote';

let mockDiscussions: Discussion[] = [];
let mockBattleProgress: {
  phase: string;
} = {
  phase: 'ATTACK'
};
let mockSelectedTeam: 'A' | 'B' = 'A';

vi.mock('@/pages/battlePage/stores/battleStore', () => ({
  useBattleStore: vi.fn((selector) => {
    const state = {
      discussions: mockDiscussions,
      battleProgress: mockBattleProgress,
      selectedTeam: mockSelectedTeam
    };
    return selector(state);
  }),
  selectDiscussions: (state: { discussions: Discussion[] }) => state.discussions,
  selectBattleProgress: (state: { battleProgress: { phase: string } }) => state.battleProgress,
  selectSelectedTeam: (state: { selectedTeam: 'A' | 'B' }) => state.selectedTeam
}));

vi.mock('@/pages/battlePage/components/discussion/DiscussionVoteItem', () => ({
  default: ({ user, content, votes, onVote }: { user: string; content: string; votes: number; onVote: () => void }) => (
    <div data-testid="discussion-item">
      <span>{user}</span>
      <span>{content}</span>
      <span>{votes}표</span>
      <button onClick={onVote}>투표</button>
    </div>
  )
}));

describe('DiscussionVote', () => {
  const mockOnVote = vi.fn();

  beforeEach(() => {
    mockOnVote.mockClear();
    mockDiscussions = [];
    mockBattleProgress = {
      phase: 'ATTACK'
    };
    mockSelectedTeam = 'A';
  });

  it('OPINION_SHARE 단계에서는 렌더링하지 않음', () => {
    mockBattleProgress = { phase: 'OPINION_SHARE' };

    const { container } = render(<DiscussionVote onVote={mockOnVote} />);

    expect(container.firstChild).toBeNull();
  });

  it('토론이 없을 때 렌더링하지 않음', () => {
    mockDiscussions = [];

    const { container } = render(<DiscussionVote onVote={mockOnVote} />);

    expect(container.firstChild).toBeNull();
  });

  it('공격 팀일 때 "제출된 이의제기 목록" 헤더 표시', () => {
    mockSelectedTeam = 'A';
    mockBattleProgress = { phase: 'ATTACK' };
    mockDiscussions = [
      { id: 1, user: 'user1', team: 'A', content: '테스트', votes: 5, totalVotes: 10, hasVoted: false }
    ];

    render(<DiscussionVote onVote={mockOnVote} />);

    expect(screen.getByText('제출된 이의제기 목록')).toBeInTheDocument();
    expect(screen.getByText(/이의제기가 실시간으로 추가/)).toBeInTheDocument();
  });

  it('방어 팀일 때 "제출된 반론 목록" 헤더 표시', () => {
    mockSelectedTeam = 'A';
    mockBattleProgress = { phase: 'DEFENSE' };
    mockDiscussions = [
      { id: 1, user: 'user1', team: 'B', content: '테스트', votes: 5, totalVotes: 10, hasVoted: false }
    ];

    render(<DiscussionVote onVote={mockOnVote} />);

    expect(screen.getByText('제출된 반론 목록')).toBeInTheDocument();
    expect(screen.getByText(/반론이 실시간으로 추가/)).toBeInTheDocument();
  });

  it('토론 목록과 총 개수 정확히 표시', () => {
    mockDiscussions = [
      { id: 1, user: 'user1', team: 'A', content: '첫번째 의견', votes: 5, totalVotes: 10, hasVoted: false },
      { id: 2, user: 'user2', team: 'A', content: '두번째 의견', votes: 3, totalVotes: 10, hasVoted: false }
    ];

    render(<DiscussionVote onVote={mockOnVote} />);

    expect(screen.getAllByTestId('discussion-item')).toHaveLength(2);
    expect(screen.getByText('첫번째 의견')).toBeInTheDocument();
    expect(screen.getByText('두번째 의견')).toBeInTheDocument();
    expect(screen.getByText(/총 2개의/)).toBeInTheDocument();
  });

  it('토론 아이템 투표 시 onVote 콜백 호출', () => {
    mockDiscussions = [
      { id: 1, user: 'user1', team: 'A', content: '테스트', votes: 5, totalVotes: 10, hasVoted: false }
    ];

    render(<DiscussionVote onVote={mockOnVote} />);

    const voteButton = screen.getByText('투표');
    voteButton.click();

    expect(mockOnVote).toHaveBeenCalledWith(1);
  });
});
