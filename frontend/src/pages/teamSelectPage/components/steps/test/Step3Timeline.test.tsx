import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Step3Timeline from '../Step3Timeline';
import type { TimelineItem } from '../../../types/teamSelect';

describe('Step3Timeline', () => {
  const mockTimelines: TimelineItem[] = [
    {
      id: '1',
      type: 'ATTACK',
      team: 'A',
      author: 'Alice',
      content: '구현 A의 Set 사용이 더 효율적입니다.',
      upvotes: 15,
      timestamp: Date.now() - 2 * 60 * 60 * 1000
    },
    {
      id: '2',
      type: 'DEFENSE',
      team: 'B',
      author: 'Bob',
      content: 'Set은 순서를 보장하지 않습니다.',
      upvotes: 12,
      timestamp: Date.now() - 1 * 60 * 60 * 1000
    }
  ];

  it('렌더링된다', () => {
    render(<Step3Timeline timelines={mockTimelines} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('모든 타임라인 아이템이 표시된다', () => {
    render(<Step3Timeline timelines={mockTimelines} />);

    expect(screen.getByText('구현 A의 Set 사용이 더 효율적입니다.')).toBeInTheDocument();
    expect(screen.getByText('Set은 순서를 보장하지 않습니다.')).toBeInTheDocument();
  });

  it('빈 타임라인일 때 메시지가 표시된다', () => {
    render(<Step3Timeline timelines={[]} />);

    expect(screen.getByText(/아직 이의제기나 반박이 없습니다/)).toBeInTheDocument();
  });

  it('TimelineItem 컴포넌트를 사용한다', () => {
    render(<Step3Timeline timelines={mockTimelines} />);

    // TimelineItem이 렌더링하는 요소들 확인
    expect(screen.getByText('A팀')).toBeInTheDocument();
    expect(screen.getByText('B팀')).toBeInTheDocument();
  });

  it('설명 텍스트가 표시된다', () => {
    render(<Step3Timeline timelines={mockTimelines} />);

    expect(screen.getByText(/배틀 진행 과정/)).toBeInTheDocument();
  });

  it('스크롤 가능한 컨테이너를 가진다', () => {
    const { container } = render(<Step3Timeline timelines={mockTimelines} />);

    const scrollContainer = container.querySelector('.overflow-auto');
    expect(scrollContainer).toBeInTheDocument();
  });
});
