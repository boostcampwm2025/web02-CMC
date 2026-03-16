export const BATTLE_ID = 'test-battle-001';

export const DEFAULT_BATTLE_JOIN_DATA = {
  battleId: BATTLE_ID,
  round: 1,
  topics: ['가독성', '유지보수성', '코드 스타일'],
  phase: 'OPINION_SHARE' as string,
  phaseCount: 1,
  startedAt: Date.now() - 60000,
  expiredAt: Date.now() + 180000,
  counts: { teamA: 5, teamB: 3, teamNone: 2 },
  timelines: { attacks: [], defenses: [] },
  chats: [] as Array<{ messageId: string; battleId: string; sender: { userId: string; nickname: string; tier?: string }; team: string; scope: string; text: string; createdAt: string; type?: string }>,
  allChats: [
    {
      messageId: 'prev-msg-001',
      battleId: BATTLE_ID,
      sender: { userId: 'user-a', nickname: '이전유저', tier: 'GOLD' },
      team: 'NONE',
      scope: 'ALL',
      text: '이전 채팅 내용입니다',
      createdAt: new Date(Date.now() - 60000).toISOString(),
      type: 'chat',
    },
  ] as Array<{ messageId: string; battleId: string; sender: { userId: string; nickname: string; tier?: string }; team: string; scope: string; text: string; createdAt: string; type?: string }>,
  attacks: [],
  defenses: [],
};

export const MOCK_REFERENCE_DATA = {
  commonConcepts: {
    terms: [{ term: '가독성', description: '코드를 얼마나 읽기 쉬운지를 나타내는 척도' }],
    summary: '코드 스타일의 가독성 비교',
  },
  teamA: {
    perspective: 'A팀 관점: 블록 if가 더 명확하다',
    references: [],
  },
  teamB: {
    perspective: 'B팀 관점: 한 줄 if가 더 간결하다',
    references: [],
  },
};

export const MOCK_BATTLE_INFO = {
  id: BATTLE_ID,
  title: '블록 if vs 한 줄 if',
  description: '코드 스타일 비교: 블록 형태의 if문과 한 줄 if문 중 어떤 것이 더 가독성이 좋을까요?',
  aCode: 'if (condition) {\n  doSomething();\n}',
  bCode: 'if (condition) doSomething();',
  language: 'JavaScript',
  category: 'REFACTORING',
  participantCount: 42,
  currentRound: 1,
  totalRounds: 3,
  topics: ['가독성', '유지보수성', '코드 스타일'],
  currentPhase: 'OPINION_SHARE' as const,
  phaseCount: 1,
  timelines: { attacks: [], defenses: [] },
  inviteCode: 'TEST-INVITE',
};
