import type { TutorialStep } from '../../../hooks/useTutorial';

export interface StepContent {
  title: string;
  description: string;
  stepNumber: number;
  highlightElement?: string;
}

export const MOCK_DISCUSSIONS = [
  {
    id: 1,
    user: '김개발',
    team: 'A' as const,
    content: 'A 코드는 가독성이 좋고 유지보수가 쉬워 보입니다.',
    votes: 12,
    totalVotes: 25,
    hasVoted: false
  },
  {
    id: 2,
    user: '박코딩',
    team: 'B' as const,
    content: 'B 코드가 성능 면에서 더 효율적입니다.',
    votes: 13,
    totalVotes: 25,
    hasVoted: false
  }
];

export const TUTORIAL_STEPS: Record<TutorialStep, StepContent | null> = {
  welcome: null,
  phaseGuide: {
    title: '현재 페이즈 안내',
    description:
      '지금 무엇을 해야 하는지 알려드립니다. 페이즈마다 할 수 있는 행동이 달라요! 이의제기 → 반론 → 진영 변경 순서로 진행됩니다.',
    stepNumber: 1,
    highlightElement: '[data-tutorial="phase-guide"]'
  },
  progressBoard: {
    title: '배틀 현황판',
    description:
      '현재 페이즈 진행 상황을 한눈에 확인하세요. 단계 아이콘이 활성 페이즈를 표시하고, 하단에서 라운드를 확인할 수 있어요. 필요하면 접어둘 수도 있습니다.',
    stepNumber: 2,
    highlightElement: '[data-tutorial="progress-board"]'
  },
  teamStatus: {
    title: '팀 현황',
    description:
      'A팀, B팀, 중립의 실시간 인원수를 확인하세요. 인원이 변하면 애니메이션이 재생됩니다! 하단의 막대 그래프로 비율을 한눈에 파악할 수 있어요.',
    stepNumber: 3,
    highlightElement: '[data-tutorial="team-status"]'
  },
  codeCompare: {
    title: '코드 비교',
    description:
      '두 팀의 코드를 비교하고 분석하세요. 상단 버튼으로 탭 보기와 분할 보기를 전환할 수 있어요. 코드에 마우스를 올리면 라인 번호가 표시됩니다.',
    stepNumber: 4,
    highlightElement: '[data-tutorial="code-section"]'
  },
  vote: {
    title: '투표',
    description: '더 나은 코드를 선택하세요! 투표는 각 라운드마다 진행되며, 실시간으로 결과가 반영됩니다.',
    stepNumber: 5,
    highlightElement: '[data-tutorial="vote"]'
  },
  chat: {
    title: '채팅',
    description:
      '팀 채팅으로 전략을 논의하거나, 전체 채팅으로 모두와 소통하세요! 채팅창 상단의 탭을 클릭하여 전환할 수 있습니다.',
    stepNumber: 6,
    highlightElement: '[data-tutorial="chat"]'
  },
  discussionInput: {
    title: '의견 입력',
    description:
      '이의제기 페이즈에는 이의제기를, 반론 페이즈에는 반박을 작성할 수 있어요. 엔터키로 빠르게 제출할 수 있습니다!',
    stepNumber: 7,
    highlightElement: '[data-tutorial="discussion-input"]'
  },
  sidebar: {
    title: '사이드바',
    description: '사이드바에서 문제 설명과 타임라인을 확인할 수 있어요. 필요한 정보를 빠르게 찾아보세요!',
    stepNumber: 8,
    highlightElement: '[data-tutorial="sidebar-buttons"]'
  },
  sidebarPanel: {
    title: '사이드바 상세 보기',
    description:
      '사이드바가 열렸어요. 상단 탭으로 문제 설명과 타임라인을 전환할 수 있고, 필요한 정보를 빠르게 확인할 수 있어요.',
    stepNumber: 9,
    highlightElement: '[data-tutorial="sidebar-panel"]'
  },
  completed: null
};

export const TOTAL_STEPS = 9;
