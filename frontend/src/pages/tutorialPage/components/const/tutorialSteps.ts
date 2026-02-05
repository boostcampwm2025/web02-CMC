import type { TutorialStep } from '@/pages/battlePage/hooks/useTutorial';

export interface StepContent {
  title: string;
  description: string;
  stepNumber: number;
  highlightElement?: string;
  tasks?: string[];
  tip?: string;
}

export const MOCK_DISCUSSIONS = [
  {
    id: 1,
    user: '김개발',
    team: 'A' as const,
    content: 'A안(블록 if)은 조건이 명확해서 읽기 쉬워요.',
    votes: 12,
    totalVotes: 25,
    hasVoted: false
  },
  {
    id: 2,
    user: '박코딩',
    team: 'B' as const,
    content: 'B안(한 줄 if)은 불필요한 중괄호가 없어 간결합니다.',
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
    highlightElement: '[data-tutorial="phase-guide"]',
    tasks: ['라운드와 페이즈를 확인하세요.', '지금 가능한 행동(이의제기/반론)을 확인하세요.'],
    tip: '페이즈가 바뀌면 입력창 색상과 버튼 문구도 함께 바뀝니다.'
  },
  progressBoard: {
    title: '배틀 현황판',
    description:
      '현재 페이즈 진행 상황을 한눈에 확인하세요. 단계 아이콘이 활성 페이즈를 표시하고, 하단에서 라운드를 확인할 수 있어요. 필요하면 접어둘 수도 있습니다.',
    stepNumber: 2,
    highlightElement: '[data-tutorial="progress-board"]',
    tasks: ['현재 라운드 위치를 확인하세요.', '남은 시간을 확인하세요.'],
    tip: '현황판은 접었다 펼 수 있어 화면을 넓게 쓸 수 있어요.'
  },
  teamStatus: {
    title: '팀 현황',
    description:
      'A팀, B팀, 중립의 실시간 인원수를 확인하세요. 인원이 변하면 애니메이션이 재생됩니다! 하단의 막대 그래프로 비율을 한눈에 파악할 수 있어요.',
    stepNumber: 3,
    highlightElement: '[data-tutorial="team-status"]',
    tasks: ['현재 팀 인원 비율을 확인하세요.', '우세한 진영이 어디인지 파악해보세요.'],
    tip: '진영 변경 페이즈가 오면 이 정보가 중요해집니다.'
  },
  codeCompare: {
    title: '코드 비교',
    description:
      '두 팀의 코드를 비교하고 분석하세요. 상단 버튼으로 탭 보기와 분할 보기를 전환할 수 있어요. 코드에 마우스를 올리면 라인 번호가 표시됩니다.',
    stepNumber: 4,
    highlightElement: '[data-tutorial="code-section"]',
    tasks: ['A/B 코드를 번갈아 살펴보세요.', '성능/가독성 차이를 메모해보세요.'],
    tip: '분할 보기는 비교에, 탭 보기는 집중 분석에 유리합니다.'
  },
  vote: {
    title: '투표',
    description: '더 나은 코드를 선택하세요! 투표는 각 라운드마다 진행되며, 실시간으로 결과가 반영됩니다.',
    stepNumber: 5,
    highlightElement: '[data-tutorial="vote"]',
    tasks: ['마음에 드는 주장에 투표해보세요.', '득표수가 바로 반영되는지 확인하세요.'],
    tip: '투표는 라운드마다 새로 시작됩니다.'
  },
  chat: {
    title: '채팅',
    description:
      '팀 채팅으로 전략을 논의하거나, 전체 채팅으로 모두와 소통하세요! 채팅창 상단의 탭을 클릭하여 전환할 수 있습니다.',
    stepNumber: 6,
    highlightElement: '[data-tutorial="chat"]',
    tasks: ['팀 채팅과 전체 채팅을 번갈아 확인하세요.', '간단한 메시지를 입력해보세요.'],
    tip: '팀 채팅은 같은 진영과만, 전체 채팅은 모두에게 공유됩니다.'
  },
  discussionInput: {
    title: '의견 입력',
    description:
      '이의제기 페이즈에는 이의제기를, 반론 페이즈에는 반박을 작성할 수 있어요. 엔터키로 빠르게 제출할 수 있습니다!',
    stepNumber: 7,
    highlightElement: '[data-tutorial="discussion-input"]',
    tasks: ['간단한 주장 한 줄을 입력해보세요.', '엔터키로 제출해보세요.'],
    tip: '입력창이 잠겨 있다면 현재 페이즈가 공격/방어가 아닐 수 있어요.'
  },
  sidebar: {
    title: '사이드바',
    description: '사이드바에서 문제 설명과 타임라인을 확인할 수 있어요. 필요한 정보를 빠르게 찾아보세요!',
    stepNumber: 8,
    highlightElement: '[data-tutorial="sidebar-buttons"]',
    tasks: ['책갈피 아이콘을 눌러 사이드바를 열어보세요.'],
    tip: '사이드바에는 문제 요약과 라운드 흐름이 정리되어 있어요.'
  },
  sidebarPanel: {
    title: '사이드바 상세 보기',
    description:
      '사이드바가 열렸어요. 상단 탭으로 문제 설명과 타임라인을 전환할 수 있고, 필요한 정보를 빠르게 확인할 수 있어요.',
    stepNumber: 9,
    highlightElement: '[data-tutorial="sidebar-panel"]',
    tasks: ['문제 설명 탭을 확인하세요.', '타임라인 탭으로 전환해보세요.'],
    tip: '타임라인을 보면 라운드별 쟁점을 빠르게 복습할 수 있어요.'
  },
  completed: null
};

export const TOTAL_STEPS = 9;
