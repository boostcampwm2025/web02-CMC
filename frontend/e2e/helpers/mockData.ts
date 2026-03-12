export const BATTLE_ID = 'test-battle-001';

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
