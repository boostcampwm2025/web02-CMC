import type { BattlePhaseName, BattleTeam, BattleDiscussionStatus, BattleChatScope } from '@cmc/types';
export type { BattlePhaseName, BattleTeam, BattleDiscussionStatus, BattleChatScope };

// BattleChat 타입
export interface BattleChat {
  battleId: string;
  scope: BattleChatScope;
  messageId: string;
  sender: { userId: string; nickname: string; tier?: string };
  team: BattleTeam;
  text: string;
  createdAt: Date | string;
  type?: 'chat' | 'attack' | 'defense';
  votes?: number;
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
  topics: string[];
  currentPhase: BattlePhaseName;
  phaseCount: number;
  timelines: {
    attacks: BattleDiscussion[];
    defenses: BattleDefense[];
  };
  referenceData?: BattleReferenceData | null;
  inviteCode?: string;
}

// BattleDiscussion 타입
export interface BattleDiscussion {
  discussionId: string;
  author: {
    id: string;
    nickname: string;
  };
  type: 'ATTACK' | 'DEFENSE';
  content: string;
  upvotes: number;
  votes: string[];
  status: BattleDiscussionStatus;
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
  from: BattleTeam;
  to: BattleTeam;
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
  topics: string[];
  phase: BattlePhaseName;
  phaseCount: number;
  startedAt: number | null;
  expiredAt: number | null;
}

export interface UseBattleSocketProps {
  battleId: string;
  userId: string;
  team: BattleTeam;
  password?: string;
}

export interface BattleProgressState {
  round: number;
  phase: BattlePhaseName;
  phaseCount: number;
  topic: string;
  startedAt: number | null;
  expiredAt: number | null;
}

// Battle:Attacked 이벤트 응답 타입
export interface DiscussionVoteResultItem {
  id: string | null;
  text: string | null;
  ownerId: string | null;
  nickname: string | null;
  count: number | null;
  team: BattleTeam | null;
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
  dominantTeam: BattleTeam | null;
}

// AI 참고 자료 타입
export interface ReferenceTerm {
  term: string;
  description: string;
}

export interface ReferenceLink {
  title: string;
  url: string;
  summary: string;
}

export interface TeamReference {
  perspective: string;
  references: ReferenceLink[];
}

export interface BattleReferenceData {
  commonConcepts: {
    terms: ReferenceTerm[];
    summary: string;
  };
  teamA: TeamReference;
  teamB: TeamReference;
}
