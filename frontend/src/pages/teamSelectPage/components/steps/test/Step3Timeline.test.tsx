import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step3Timeline from '../Step3Timeline';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

describe('Step3Timeline', () => {
  const mockAttackA: BattleDiscussion = {
    discussionId: '1',
    authorId: 'user-alice',
    content: '구현 A의 Set 사용이 더 효율적입니다.',
    upvotes: 15,
    votes: [],
    status: 'SELECTED',
    type: 'ATTACK',
    team: 'A',
    selectedAt: Date.now() - 2 * 60 * 60 * 1000
  };

  const mockAttackB: BattleDiscussion = {
    discussionId: '2',
    authorId: 'user-bob',
    content: '구현 B의 Map 사용이 더 효율적입니다.',
    upvotes: 13,
    votes: [],
    status: 'SELECTED',
    type: 'ATTACK',
    team: 'B',
    selectedAt: Date.now() - 2 * 60 * 60 * 1000
  };

  const mockDefenseA: BattleDefense = {
    discussionId: '3',
    authorId: 'user-charlie',
    content: 'Map은 메모리를 더 많이 사용합니다.',
    upvotes: 10,
    votes: [],
    status: 'SELECTED',
    type: 'DEFENSE',
    team: 'A',
    selectedAt: Date.now() - 1 * 60 * 60 * 1000,
    attackId: '2'
  };

  const mockDefenseB: BattleDefense = {
    discussionId: '4',
    authorId: 'user-david',
    content: 'Set은 순서를 보장하지 않습니다.',
    upvotes: 12,
    votes: [],
    status: 'SELECTED',
    type: 'DEFENSE',
    team: 'B',
    selectedAt: Date.now() - 1 * 60 * 60 * 1000,
    attackId: '1'
  };

  const mockTimelines = [mockAttackA, mockAttackB, mockDefenseA, mockDefenseB];

  it('렌더링된다', () => {
    render(<Step3Timeline timelines={mockTimelines} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    // 상단 섹션 확인
    expect(screen.getByText('타임라인')).toBeInTheDocument();
    expect(screen.getByText('양측의 이의제기와 반박을 확인해보세요')).toBeInTheDocument();
  });

  it('라운드 헤더가 표시된다', () => {
    render(<Step3Timeline timelines={mockTimelines} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    // 라운드 1 헤더 확인
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('현재 라운드는 기본으로 펼쳐진다', () => {
    render(<Step3Timeline timelines={mockTimelines} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    // 타임라인 내용이 보임
    expect(screen.getByText('구현 A의 Set 사용이 더 효율적입니다.')).toBeInTheDocument();
    expect(screen.getByText('Set은 순서를 보장하지 않습니다.')).toBeInTheDocument();
  });

  it('라운드를 접거나 펼칠 수 있다', async () => {
    const user = userEvent.setup();
    render(<Step3Timeline timelines={mockTimelines} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    // 라운드 1 버튼 찾기
    const roundButton = screen.getByRole('button', { name: /Round 1/i });

    // 초기에는 펼쳐져 있음
    expect(screen.getByText('구현 A의 Set 사용이 더 효율적입니다.')).toBeInTheDocument();

    // 클릭해서 접기
    await user.click(roundButton);

    // 내용이 사라짐
    expect(screen.queryByText('구현 A의 Set 사용이 더 효율적입니다.')).not.toBeInTheDocument();

    // 다시 클릭해서 펼치기
    await user.click(roundButton);

    // 내용이 다시 보임
    expect(screen.getByText('구현 A의 Set 사용이 더 효율적입니다.')).toBeInTheDocument();
  });

  it('빈 타임라인일 때 메시지가 표시된다', () => {
    render(<Step3Timeline timelines={[]} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    expect(screen.getByText('아직 이의제기가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('배틀이 시작되면 여기에 표시됩니다')).toBeInTheDocument();
  });

  it('활성 라운드는 강조 표시된다', () => {
    render(<Step3Timeline timelines={mockTimelines} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    // "진행 중" 텍스트 확인
    expect(screen.getByText('진행 중')).toBeInTheDocument();
  });

  it('미래 라운드는 비활성화된다', () => {
    render(<Step3Timeline timelines={mockTimelines} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    // 라운드 2 버튼 찾기
    const round2Button = screen.getByRole('button', { name: /Round 2/i });

    // disabled 속성 확인
    expect(round2Button).toBeDisabled();
  });

  it('팀 배지가 표시된다', () => {
    render(<Step3Timeline timelines={mockTimelines} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    // A팀, B팀 배지 확인 (A팀 attack이 있고, B팀 defense가 있음)
    const teamABadges = screen.getAllByText('A팀');
    const teamBBadges = screen.getAllByText('B팀');
    expect(teamABadges.length).toBeGreaterThan(0);
    expect(teamBBadges.length).toBeGreaterThan(0);
  });

  it('투표 수가 표시된다', () => {
    render(<Step3Timeline timelines={mockTimelines} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    // 투표 수 확인
    expect(screen.getByText('15')).toBeInTheDocument(); // mockAttack upvotes
    expect(screen.getByText('12')).toBeInTheDocument(); // mockDefense upvotes
  });

  it('VS 레이아웃으로 표시된다', () => {
    render(<Step3Timeline timelines={mockTimelines} currentRound={1} totalRounds={2} topics={['효율성', '가독성']} />);

    // Phase 헤더 확인 (A 이의제기, B 반론)
    expect(screen.getByText('A 이의제기')).toBeInTheDocument();
    expect(screen.getByText('B 반론')).toBeInTheDocument();
  });
});
