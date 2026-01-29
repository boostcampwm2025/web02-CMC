import type {
  BattleChat,
  BattleDefense,
  BattleDiscussion,
  BattleInfo,
  BattleProgressState
} from '@/commons/types/battle';
import type { AuthUser } from '@/commons/types/AuthUser';

const now = Date.now();
const minutesAgo = (minutes: number) => now - minutes * 60 * 1000;

export const TUTORIAL_BATTLE_ID = 'tutorial';

export const TUTORIAL_USER: AuthUser = {
  id: 'tutorial-user',
  nickname: '플레이어',
  type: 'guest'
};

const topics = ['가독성', '팀 코딩 스타일'];

const attacks: BattleDiscussion[] = [
  {
    discussionId: 'tut-a1',
    author: { id: 'user-a', nickname: '알고리즘러' },
    type: 'ATTACK',
    content: 'A안은 블록이 명확해서 조건 분기가 눈에 잘 들어옵니다.',
    upvotes: 18,
    votes: ['u1', 'u2', 'u3'],
    status: 'SELECTED',
    selectedAt: minutesAgo(8),
    team: 'A'
  },
  {
    discussionId: 'tut-a2',
    author: { id: 'user-b', nickname: '리뷰장인' },
    type: 'ATTACK',
    content: 'B안은 한 줄 if라서 흐름이 더 간결합니다.',
    upvotes: 14,
    votes: ['u4', 'u5'],
    status: 'SELECTED',
    selectedAt: minutesAgo(6),
    team: 'B'
  },
  {
    discussionId: 'tut-a3',
    author: { id: 'user-c', nickname: '코드헌터' },
    type: 'ATTACK',
    content: '블록 스타일은 팀 컨벤션을 통일하기 쉬워요.',
    upvotes: 9,
    votes: ['u6'],
    status: 'SELECTED',
    selectedAt: minutesAgo(4),
    team: 'A'
  },
  {
    discussionId: 'tut-a4',
    author: { id: 'user-d', nickname: '디버거' },
    type: 'ATTACK',
    content: '한 줄 if는 불필요한 중괄호가 없어 더 간결합니다.',
    upvotes: 7,
    votes: ['u7'],
    status: 'SELECTED',
    selectedAt: minutesAgo(3),
    team: 'B'
  }
];

const defenses: BattleDefense[] = [
  {
    discussionId: 'tut-d1',
    attackId: 'tut-a1',
    author: { id: 'user-e', nickname: '안전주의자' },
    type: 'DEFENSE',
    content: '한 줄 if도 팀이 익숙하면 문제 없습니다. 오히려 간단합니다.',
    upvotes: 11,
    votes: ['u8'],
    status: 'SELECTED',
    selectedAt: minutesAgo(7),
    team: 'B'
  },
  {
    discussionId: 'tut-d2',
    attackId: 'tut-a2',
    author: { id: 'user-f', nickname: '클린코더' },
    type: 'DEFENSE',
    content: '블록 스타일은 대다수 코드베이스에서 기본 컨벤션입니다.',
    upvotes: 10,
    votes: ['u9'],
    status: 'SELECTED',
    selectedAt: minutesAgo(5),
    team: 'A'
  },
  {
    discussionId: 'tut-d3',
    attackId: 'tut-a3',
    author: { id: 'user-g', nickname: '실무파' },
    type: 'DEFENSE',
    content: '한 줄 if는 early return 패턴을 강조해 흐름이 깔끔합니다.',
    upvotes: 6,
    votes: ['u10'],
    status: 'SELECTED',
    selectedAt: minutesAgo(3),
    team: 'B'
  },
  {
    discussionId: 'tut-d4',
    attackId: 'tut-a4',
    author: { id: 'user-h', nickname: '리팩터러' },
    type: 'DEFENSE',
    content: '블록을 쓰면 추후 로직 추가가 더 자연스럽습니다.',
    upvotes: 5,
    votes: ['u11'],
    status: 'SELECTED',
    selectedAt: minutesAgo(2),
    team: 'A'
  }
];

export const TUTORIAL_ATTACK_MESSAGES = {
  A: [attacks[0].content, attacks[2].content],
  B: [attacks[1].content, attacks[3].content]
} as const;

export const TUTORIAL_BATTLE_INFO: BattleInfo = {
  title: '튜토리얼: if문 한 줄 vs 블록',
  description: 'if () return null; 과 if () { return null; } 스타일 중 어떤 코드가 더 읽기 쉬운지 비교합니다.',
  aCode: `if (!user) {
  return null;
}`,
  bCode: `if (!user) return null;`,
  language: 'TS',
  category: 'IMPLEMENTATION',
  participantCount: 30,
  currentRound: 1,
  totalRounds: topics.length,
  topics,
  currentPhase: 'ATTACK',
  phaseCount: 1,
  timelines: {
    attacks,
    defenses
  },
  referenceData: {
    commonConcepts: {
      summary:
        'if문 스타일은 가독성, 팀 컨벤션, 확장성 관점에서 논의됩니다. 핵심은 팀이 읽기 쉽고 유지보수하기 쉬운 규칙을 합의하는 것입니다.',
      terms: [
        {
          term: 'early return',
          description:
            '조건을 만족하지 않으면 빠르게 함수에서 빠져나오는 패턴입니다. 들여쓰기를 줄여 흐름을 단순화합니다.'
        },
        {
          term: '팀 컨벤션',
          description: '팀이 합의한 코드 스타일 규칙으로, 리뷰 기준과 코드 일관성을 유지하는 기준입니다.'
        }
      ]
    },
    teamA: {
      perspective: '블록 if는 조건 분기를 명확히 드러내고, 추후 로직 확장에 유리하다는 관점입니다.',
      references: [
        {
          title: '블록 if의 가독성 장점',
          url: 'https://google.github.io/styleguide/jsguide.html#s4.1.1-braces-all',
          summary: '조건 분기에서 중괄호를 사용하는 이유와 일관성에 대한 가이드를 제공합니다.'
        }
      ]
    },
    teamB: {
      perspective: '한 줄 if는 간결하고 흐름을 빠르게 파악할 수 있다는 관점입니다.',
      references: [
        {
          title: '한 줄 if와 early return',
          url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
          summary: '조건문을 통한 early return 흐름을 설명하며, 코드 분기를 단순화하는 패턴을 확인할 수 있습니다.'
        }
      ]
    }
  }
};

export const TUTORIAL_BATTLE_PROGRESS: BattleProgressState = {
  round: 1,
  phase: 'ATTACK',
  phaseCount: 1,
  topic: topics[0],
  startedAt: minutesAgo(1),
  expiredAt: now + 4 * 60 * 1000
};

export const TUTORIAL_TEAM_COUNTS = {
  teamACount: 14,
  teamBCount: 12,
  none: 4
};

export const TUTORIAL_TEAM_CHATS: BattleChat[] = [
  {
    messageId: 'tut-team-1',
    battleId: TUTORIAL_BATTLE_ID,
    sender: { userId: 'user-a', nickname: '알고리즘러' },
    team: 'A',
    scope: 'TEAM',
    text: 'A안은 한 줄 if라서 흐름이 깔끔해요.',
    createdAt: new Date(minutesAgo(3)).toISOString()
  },
  {
    messageId: 'tut-team-2',
    battleId: TUTORIAL_BATTLE_ID,
    sender: { userId: 'user-b', nickname: '리뷰장인' },
    team: 'B',
    scope: 'TEAM',
    text: 'B안은 블록이라 리뷰할 때 명확하게 보여요.',
    createdAt: new Date(minutesAgo(2)).toISOString()
  }
];

export const TUTORIAL_ALL_CHATS: BattleChat[] = [
  {
    messageId: 'tut-all-1',
    battleId: TUTORIAL_BATTLE_ID,
    sender: { userId: 'user-c', nickname: '코드헌터' },
    team: 'A',
    scope: 'ALL',
    text: '한 줄 if는 early return 패턴을 잘 보여주네요.',
    createdAt: new Date(minutesAgo(4)).toISOString()
  },
  {
    messageId: 'tut-all-2',
    battleId: TUTORIAL_BATTLE_ID,
    sender: { userId: 'user-d', nickname: '디버거' },
    team: 'B',
    scope: 'ALL',
    text: '블록 스타일이 팀 컨벤션에 더 잘 맞는 것 같아요.',
    createdAt: new Date(minutesAgo(1)).toISOString()
  }
];
