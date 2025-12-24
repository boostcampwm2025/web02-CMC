// BattleChat 타입
export interface BattleChat {
  battleId: string;
  scope: 'TEAM' | 'ALL';
  messageId: string;
  sender: string;
  team: Team;
  text: string;
  createdAt: Date;
}

export interface BattleInfo {
  title: string;
  description: string;
  aCode: string;
  bCode: string;
}

// 공통 타입들
export type BattlePhase = 'OPINION_SHARE' | 'TEAM_A_ATTACK' | 'TEAM_B_ATTACK' | 'TEAM_SWITCH';
export type Team = 'A' | 'B' | 'NONE';
export type TurnStatus = 'A_ATTACK' | 'B_ATTACK' | 'A_DEFENSE' | 'B_DEFENSE';

// BattleDiscussion 타입
export interface BattleDiscussion {
  discussionId: string;
  authorId: string;
  type: 'ATTACK' | 'DEFENSE';
  content: string;
  upvotes: number;
  votes: string[];
  status: 'PENDING' | 'SELECTED' | 'REJECTED';
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
  phase: BattlePhase;
  turn: {
    status: TurnStatus;
    count: number;
  } | null;
  startedAt: number;
  expiredAt: number;
}

export interface UseBattleSocketProps {
  battleId: string;
  userId: string;
  team: Team;
  password?: string;
}

export interface BattleProgressState {
  round: number;
  phase: BattlePhase;
  turn: {
    status: TurnStatus;
    count: number;
  } | null;
  startedAt: number;
  expiredAt: number;
}

// Battle:Attacked 이벤트 응답 타입
export interface BattleAttackedResult {
  battleId: string;
  attack: {
    discussionId: string;
    authorId: string;
    type: string;
    text: string;
    upvotes: number;
  };
}

// Battle:Defensed 이벤트 응답 타입
export interface BattleDefensedResult {
  battleId: string;
  defense: {
    discussionId: string;
    authorId: string;
    type: string;
    text: string;
    upvotes: number;
  };
}

// 이펙트 타입
export type BattleEffectType = 'OBJECTION' | 'REVERSAL' | 'SURRENDER';
