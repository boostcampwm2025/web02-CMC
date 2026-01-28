import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimelineItem from '../TimelineItem';

describe('TimelineItem', () => {
  const mockTimelines = [
    {
      id: '1',
      type: 'ATTACK' as const,
      team: 'A' as const,
      author: 'Alice',
      content: '구현 A의 Set 사용이 더 효율적입니다.',
      upvotes: 15,
      timestamp: 1704067200000
    }
  ];

  it('렌더링된다', () => {
    render(
      <TimelineItem
        id="1"
        type="ATTACK"
        team="A"
        author="Alice"
        content="구현 A의 Set 사용이 더 효율적입니다."
        upvotes={15}
        timestamp={1704067200000}
        allTimelines={mockTimelines}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('구현 A의 Set 사용이 더 효율적입니다.')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('ATTACK 타입은 초록색 테두리를 사용한다', () => {
    const { container } = render(
      <TimelineItem
        id="1"
        type="ATTACK"
        team="A"
        author="Alice"
        content="이의제기 내용"
        upvotes={10}
        timestamp={1704067200000}
        allTimelines={mockTimelines}
      />
    );

    const item = container.firstChild;
    expect(item).toHaveClass('border-[#4CAF50]');
  });

  it('DEFENSE 타입은 빨간색 테두리를 사용한다', () => {
    const { container } = render(
      <TimelineItem
        id="1"
        type="DEFENSE"
        team="B"
        author="Bob"
        content="반박 내용"
        upvotes={12}
        timestamp={1704067200000}
        allTimelines={mockTimelines}
      />
    );

    const item = container.firstChild;
    expect(item).toHaveClass('border-[#FB2C36]');
  });

  it('A팀 배지가 표시된다', () => {
    render(
      <TimelineItem
        id="1"
        type="ATTACK"
        team="A"
        author="Alice"
        content="내용"
        upvotes={5}
        timestamp={1704067200000}
        allTimelines={mockTimelines}
      />
    );

    expect(screen.getByText('A팀')).toBeInTheDocument();
  });

  it('B팀 배지가 표시된다', () => {
    render(
      <TimelineItem
        id="1"
        type="DEFENSE"
        team="B"
        author="Bob"
        content="내용"
        upvotes={5}
        timestamp={1704067200000}
        allTimelines={mockTimelines}
      />
    );

    expect(screen.getByText('B팀')).toBeInTheDocument();
  });

  it('좋아요 아이콘과 개수가 표시된다', () => {
    render(
      <TimelineItem
        id="1"
        type="ATTACK"
        team="A"
        author="Alice"
        content="내용"
        upvotes={25}
        timestamp={1704067200000}
        allTimelines={mockTimelines}
      />
    );

    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('timestamp가 상대 시간으로 표시된다', () => {
    // 현재 시간보다 2시간 전
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    render(
      <TimelineItem
        id="1"
        type="ATTACK"
        team="A"
        author="Alice"
        content="내용"
        upvotes={5}
        timestamp={twoHoursAgo}
        allTimelines={mockTimelines}
      />
    );

    // 상대 시간 형식이 표시되는지 확인 (N시간 전, N분 전, N일 전)
    const timeText = screen.getByText(/\d+(일|시간|분) 전|방금 전/);
    expect(timeText).toBeInTheDocument();
  });

  it('A팀은 파란색 배지를 사용한다', () => {
    render(
      <TimelineItem
        id="1"
        type="ATTACK"
        team="A"
        author="Alice"
        content="내용"
        upvotes={5}
        timestamp={1704067200000}
        allTimelines={mockTimelines}
      />
    );

    const badge = screen.getByText('A팀').closest('span');
    expect(badge).toHaveClass('bg-[#155DFC]');
  });

  it('B팀은 빨간색 배지를 사용한다', () => {
    render(
      <TimelineItem
        id="1"
        type="DEFENSE"
        team="B"
        author="Bob"
        content="내용"
        upvotes={5}
        timestamp={1704067200000}
        allTimelines={mockTimelines}
      />
    );

    const badge = screen.getByText('B팀').closest('span');
    expect(badge).toHaveClass('bg-[#E7000B]');
  });

  it('반론인 경우 연결된 이의제기가 표시된다', () => {
    const timelinesWithAttack = [
      {
        id: 'attack-1',
        type: 'ATTACK' as const,
        team: 'A' as const,
        author: 'Alice',
        content: '원본 이의제기 내용입니다.',
        upvotes: 10,
        timestamp: 1704067200000
      },
      {
        id: 'defense-1',
        type: 'DEFENSE' as const,
        team: 'B' as const,
        author: 'Bob',
        content: '이에 대한 반론입니다.',
        upvotes: 8,
        timestamp: 1704070800000,
        attackId: 'attack-1'
      }
    ];

    render(
      <TimelineItem
        id="defense-1"
        type="DEFENSE"
        team="B"
        author="Bob"
        content="이에 대한 반론입니다."
        upvotes={8}
        timestamp={1704070800000}
        attackId="attack-1"
        allTimelines={timelinesWithAttack}
      />
    );

    // 연결된 이의제기 내용이 표시되는지 확인
    expect(screen.getByText(/원본 이의제기 내용입니다./)).toBeInTheDocument();
    expect(screen.getByText(/by Alice/)).toBeInTheDocument();
  });

  it('이의제기인 경우 연결된 항목이 표시되지 않는다', () => {
    render(
      <TimelineItem
        id="1"
        type="ATTACK"
        team="A"
        author="Alice"
        content="이의제기 내용"
        upvotes={10}
        timestamp={1704067200000}
        allTimelines={mockTimelines}
      />
    );

    // 연결된 항목 섹션이 없어야 함
    expect(screen.queryByText(/by/)).not.toBeInTheDocument();
  });
});
