// BattleChat 타입
export interface BattleChat {
  battleId: string;
  scope: 'TEAM' | 'ALL';
  messageId: string;
  sender: string;
  team: Team;
  text: string;
  createdAt: Date;
  type?: 'chat' | 'attack' | 'defense';
}

export interface BattleInfo {
  title: string;
  description: string;
  aCode: string;
  bCode: string;
  language: string;
  category: string;
  participantCount: number;
  currentRound: number;
  totalRounds: number;
  timelines: {
    attacks: BattleDiscussion[];
    defenses: BattleDefense[];
  };
}

// 공통 타입들
export type BattlePhase = 'PENDING' | 'OPINION_SHARE' | 'ATTACK' | 'DEFENSE' | 'TEAM_SWITCH';
export type Team = 'A' | 'B' | 'NONE';

// BattleDiscussion 타입
export interface BattleDiscussion {
  discussionId: string;
  authorId: string;
  type: 'ATTACK' | 'DEFENSE';
  content: string;
  upvotes: number;
  votes: string[];
  status: 'PENDING' | 'SELECTED' | 'REJECTED';
  selectedAt?: number; // SELECTED로 변경된 시간 (timestamp)
  team: 'A' | 'B'; // 어느 팀의 토론인지 (NONE은 불가)
}

// BattleDefense 타입
export interface BattleDefense extends BattleDiscussion {
  attackId: string;
}

// Socket 이벤트 응답 타입 (공통)
export interface TeamCounts {
  teamA: number;
  teamB: number;
  teamNone: number;
}

export interface TeamChange {
  clientId: string;
  from: Team;
  to: Team;
}

// BattleJoinResponseDto 타입
export interface BattleJoinData {
  battleId: string;
  counts: TeamCounts;
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
  phaseCount: number;
  startedAt: number | null;
  expiredAt: number | null;
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
  phaseCount: number;
  startedAt: number | null;
  expiredAt: number | null;
}

// Battle:Attacked 이벤트 응답 타입
export interface DiscussionVoteResultItem {
  id: string | null;
  text: string | null;
  ownerId: string | null;
  count: number | null;
  team: Team | null;
}

export interface BattleAttackedResult {
  battleId: string;
  attack: {
    aTeam: DiscussionVoteResultItem;
    bTeam: DiscussionVoteResultItem;
  };
}

// Battle:Defensed 이벤트 응답 타입
export interface BattleDefensedResult {
  battleId: string;
  defense: {
    aTeam: DiscussionVoteResultItem;
    bTeam: DiscussionVoteResultItem;
  };
}

// 이펙트 타입
export type BattleEffectType = 'OBJECTION' | 'REVERSAL' | 'SURRENDER';

// battle:user:update 이벤트 응답
export interface BattleUserUpdateResponse {
  battleId: string;
  totalCount: number;
  counts: TeamCounts;
}

// battle:team:update:all 이벤트 응답
export interface BattleTeamUpdateAllResponse {
  battleId: string;
  round: number;
  before: TeamCounts;
  after: TeamCounts;
  changes: TeamChange[];
  difference: {
    teamA: number;
    teamB: number;
    teamNone: number;
  };
  dominantTeam: Team | null;
}
