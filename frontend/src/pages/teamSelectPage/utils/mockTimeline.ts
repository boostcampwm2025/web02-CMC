import type { TimelineItem } from '../types/teamSelect';

export const MOCK_TIMELINES: TimelineItem[] = [
  {
    id: '1',
    type: 'ATTACK',
    team: 'A',
    author: 'Alice',
    content: '구현 A의 Set 사용이 더 효율적입니다. O(1) 시간 복잡도를 보장합니다.',
    upvotes: 15,
    timestamp: Date.now() - 300000 // 5분 전
  },
  {
    id: '2',
    type: 'DEFENSE',
    team: 'B',
    author: 'Bob',
    content: 'Set은 순서를 보장하지 않습니다. 구현 B의 객체 방식이 더 안전합니다.',
    upvotes: 12,
    timestamp: Date.now() - 240000 // 4분 전
  },
  {
    id: '3',
    type: 'ATTACK',
    team: 'B',
    author: 'Charlie',
    content: '구현 B는 메모리 효율이 떨어집니다. 불필요한 객체 생성이 많습니다.',
    upvotes: 8,
    timestamp: Date.now() - 180000 // 3분 전
  },
  {
    id: '4',
    type: 'DEFENSE',
    team: 'A',
    author: 'Diana',
    content: '가독성 측면에서 구현 A가 훨씬 명확합니다. 유지보수가 쉽습니다.',
    upvotes: 10,
    timestamp: Date.now() - 120000 // 2분 전
  },
  {
    id: '5',
    type: 'ATTACK',
    team: 'A',
    author: 'Eve',
    content: '엣지 케이스 처리가 부족합니다. null, undefined 체크가 필요합니다.',
    upvotes: 6,
    timestamp: Date.now() - 60000 // 1분 전
  }
];
