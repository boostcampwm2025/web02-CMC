import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatSection from '@/pages/battlePage/components/chatting/ChatSection';
import type { Message } from '@/pages/battlePage/utils/convertChatMessage';
import type { Team } from '@/commons/types/battle';

let mockUserId = 'user-123';
let mockSelectedTeam: Team = 'A';
let mockTeamCounts = { teamACount: 5, teamBCount: 3 };
let mockTeamMessages: Message[] = [];
let mockAllMessages: Message[] = [];
let mockOpponentNotice: Message | null = null;

vi.mock('@/pages/battlePage/stores/battleStore', () => ({
  useBattleStore: vi.fn((selector) => {
    const state = {
      userId: mockUserId,
      selectedTeam: mockSelectedTeam,
      teamCounts: mockTeamCounts
    };
    return selector(state);
  }),
  selectUserId: (state: { userId: string }) => state.userId,
  selectSelectedTeam: (state: { selectedTeam: Team }) => state.selectedTeam,
  selectTeamCounts: (state: { teamCounts: { teamACount: number; teamBCount: number } }) => state.teamCounts
}));

vi.mock('@/pages/battlePage/hooks/useBattleChat', () => ({
  useBattleChat: () => ({
    teamMessages: mockTeamMessages,
    allMessages: mockAllMessages,
    opponentNotice: mockOpponentNotice,
    sendMessage: vi.fn()
  })
}));

vi.mock('@/commons/hooks/useAutoScroll', () => ({
  useAutoScrollDown: () => ({ current: null })
}));

describe('배틀 페이지에 ChatSection 통합 테스트', () => {
  beforeEach(() => {
    mockUserId = 'user-123';
    mockSelectedTeam = 'A';
    mockTeamCounts = { teamACount: 5, teamBCount: 3 };

    mockTeamMessages = [
      { id: '1', user: 'You', team: 'A', content: 'A팀 메시지', timestamp: '2026-01-04 10:00:00', type: 'chat' }
    ];

    mockAllMessages = [
      { id: '1', user: 'You', team: 'A', content: 'A팀 메시지', timestamp: '2026-01-04 10:00:00', type: 'chat' },
      { id: '2', user: 'user-789', team: 'B', content: 'B팀 메시지', timestamp: '2026-01-04 10:02:00', type: 'chat' }
    ];
    mockOpponentNotice = null;
  });

  it('팀 채팅 활성화시 현재 팀 메시지만 표시되는지', () => {
    mockSelectedTeam = 'A';
    mockTeamMessages = [
      { id: '1', user: 'You', team: 'A', content: 'A팀 메시지', timestamp: '2026-01-04 10:00:00', type: 'chat' }
    ];
    render(<ChatSection />);

    expect(screen.getByText('A팀 메시지')).toBeInTheDocument();
    expect(screen.queryByText('B팀 메시지')).not.toBeInTheDocument();
  });

  it('전체 채팅 전환시 모든 팀 메시지 표시 되는지', () => {
    mockSelectedTeam = 'NONE';
    render(<ChatSection />);

    expect(screen.getByText('A팀 메시지')).toBeInTheDocument();
    expect(screen.getByText('B팀 메시지')).toBeInTheDocument();
  });

  it('멤버 수: 전체 = A + B', () => {
    mockSelectedTeam = 'NONE';
    render(<ChatSection />);

    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('멤버 수: 팀 = 현재 팀만', () => {
    mockSelectedTeam = 'A';
    render(<ChatSection />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('팀 채팅 탭이 활성화 된 상태에서 전체 라운지 탭 전환 눌렀을 때 잘 변환 되는지', async () => {
    mockSelectedTeam = 'A';
    render(<ChatSection />);

    // 초기: 팀 채팅 (B팀 메시지 안 보임)
    expect(screen.queryByText('B팀 메시지')).not.toBeInTheDocument();

    // 전체 라운지 탭 클릭
    await userEvent.click(screen.getByText('전체 라운지'));

    // 이제 B팀 메시지도 보임
    expect(screen.getByText('B팀 메시지')).toBeInTheDocument();
  });

  it('상대 팀의 선정된 공격 공지가 상단에 렌더링되는지', () => {
    mockSelectedTeam = 'A';
    mockOpponentNotice = {
      id: '1',
      user: 'user-789',
      team: 'B',
      content: '이 코드는 성능 문제가 있습니다',
      timestamp: '2026-01-04 10:00:00',
      type: 'attack'
    };
    render(<ChatSection />);

    expect(screen.getByText('이 코드는 성능 문제가 있습니다')).toBeInTheDocument();
  });

  it('상대 팀의 선정된 반론 공지가 상단에 렌더링되는지', () => {
    mockSelectedTeam = 'B';
    mockOpponentNotice = {
      id: '1',
      user: 'user-123',
      team: 'A',
      content: '캐싱을 사용하면 해결됩니다',
      timestamp: '2026-01-04 10:05:00',
      type: 'defense'
    };
    render(<ChatSection />);

    expect(screen.getByText('캐싱을 사용하면 해결됩니다')).toBeInTheDocument();
  });

  it('일반 채팅과 상대팀 공지가 함께 표시되는지', () => {
    mockSelectedTeam = 'A';
    mockTeamMessages = [
      { id: '1', user: 'user-123', team: 'A', content: '안녕하세요', timestamp: '2026-01-04 10:00:00', type: 'chat' }
    ];
    mockOpponentNotice = {
      id: '3',
      user: 'user-789',
      team: 'B',
      content: '이 코드는 문제가 있습니다',
      timestamp: '2026-01-04 10:01:00',
      type: 'attack'
    };
    render(<ChatSection />);

    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
    expect(screen.getByText('이 코드는 문제가 있습니다')).toBeInTheDocument();
  });

  it('팀 라운지에서도 상대팀 공지가 상단에 표시되는지', () => {
    mockSelectedTeam = 'A';
    mockTeamMessages = [
      { id: '1', user: 'user-123', team: 'A', content: 'A팀 채팅', timestamp: '2026-01-04 10:00:00', type: 'chat' }
    ];
    mockOpponentNotice = {
      id: '2',
      user: 'user-789',
      team: 'B',
      content: 'B팀의 이의제기',
      timestamp: '2026-01-04 10:01:00',
      type: 'attack'
    };
    render(<ChatSection />);

    expect(screen.getByText('A팀 채팅')).toBeInTheDocument();
    expect(screen.getByText('B팀의 이의제기')).toBeInTheDocument();
  });
});
