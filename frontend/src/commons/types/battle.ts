// BattleChat 타입
export interface BattleChat {
  authorId: string;
  content: string;
}

export interface BattleInfo {
  title: string;
  description: string;
  aCode: string;
  bCode: string;
}

// BattleDiscussion 타입
export interface BattleDiscussion {
  discussionId: string;
  authorId: string;
  type: string;
  content: string;
  upvotes: number;
}

// BattleDefense 타입
export interface BattleDefense extends BattleDiscussion {
  attackId: string;
}

// BattleJoinResponseDto 타입
export interface BattleJoinData {
  battleId: string;
  counts: {
    teamA: number;
    teamB: number;
  };
  timelines: {
    attacks: BattleDiscussion[];
    defenses: BattleDefense[];
  };
  allChats: BattleChat[];
  attacks: BattleDiscussion[];
  defenses: BattleDefense[];
  chats: BattleChat[];
  participantId?: string;

  // 배틀 상태 정보
  round: number;
  phase: 'OPINION_SHARE' | 'TEAM_A_ATTACK' | 'TEAM_B_ATTACK' | 'TEAM_SWITCH';
  turn: {
    status: 'A_ATTACK' | 'B_ATTACK' | 'A_DEFENSE' | 'B_DEFENSE';
    count: number;
  } | null;
  startedAt: number;
  expiredAt: number;
}

export interface UseBattleSocketProps {
  battleId: string;
  userId: string;
  team: 'A' | 'B' | 'NONE';
  password?: string;
}

export interface BattleProgressState {
  round: number;
  phase: 'OPINION_SHARE' | 'TEAM_A_ATTACK' | 'TEAM_B_ATTACK' | 'TEAM_SWITCH';
  turn: {
    status: 'A_ATTACK' | 'B_ATTACK' | 'A_DEFENSE' | 'B_DEFENSE';
    count: number;
  } | null;
  startedAt: number;
  expiredAt: number;
}
