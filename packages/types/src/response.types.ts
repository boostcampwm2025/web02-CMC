import type {
  BattleChat,
  BattleDefense,
  BattleDiscussion,
  BattlePhaseName,
  BattleStatus,
  BattleCategory,
  BattleLanguage,
  BattleTeam,
  TeamCounts
} from './index';

/**
 * 배틀 참가 응답
 */
export interface BattleJoinResponse {
  battleId: string;
  counts: TeamCounts;

  // 배틀 전체 타임라인 & 채팅
  timelines: {
    attacks: (BattleDiscussion | null)[];
    defenses: (BattleDiscussion | null)[];
  };
  allChats: BattleChat[];

  // 해당 진영 이의제기 & 반박 & 채팅
  attacks: (BattleDiscussion | null)[];
  defenses: (BattleDiscussion | null)[];
  chats: BattleChat[];

  // 현재 진행 중인 배틀 정보
  round: number;
  topics: string[];
  phase: BattlePhaseName;
  phaseCount: number;
  startedAt: number | null;
  expiredAt: number | null;
}

/**
 * 배틀 정보 응답 (팀 선택 페이지용)
 */
export interface BattleJoinInfoResponse {
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
}

/**
 * 배틀 목록 응답
 */
export interface BattleListItemResponse {
  id: string;
  title: string;
  description: string;
  language: BattleLanguage;
  category: BattleCategory;
  status: BattleStatus;
  createdAt: Date;
  expiresAt: Date;
  clientCount: number;
}

/**
 * 게스트 로그인 요청
 */
export interface CreateGuestRequest {
  nickname: string;
}

/**
 * 사용자 업데이트 응답
 */
export interface BattleUserUpdateResponse {
  battleId: string;
  totalCount: number;
  counts: TeamCounts;
}

/**
 * 배틀 페이즈 변경 응답
 */
export interface BattlePhaseResponse {
  battleId: string;
  phase: BattlePhaseName;
  phaseCount: number;
  startedAt: number;
  expiredAt: number;
}

/**
 * 배틀 라운드 변경 응답
 */
export interface BattleRoundResponse {
  battleId: string;
  round: number;
  topic: string;
}

/**
 * 토론 투표 응답
 */
export interface DiscussionVoteResponse {
  discussionId: string;
  upvotes: number;
  votes: string[];
}

/**
 * 배틀 종료 응답
 */
export interface BattleClosedResponse {
  battleId: string;
}

/**
 * 배틀 시작 요청
 */
export interface BattleStartRequest {
  battleId: string;
}

/**
 * 배틀 팀 투표 요청
 */
export interface BattleTeamVoteRequest {
  battleId: string;
  team: BattleTeam;
}

/**
 * 배틀 생성 요청
 */
export interface BattleCreateRequest {
  authorId: string;
  title: string;
  description: string;
  aCode: string;
  bCode: string;
  language: BattleLanguage;
  type: 'PUBLIC' | 'PRIVATE';
  category: BattleCategory;
  playTime: string;
  topics: string[];
  password?: string;
}

/**
 * 배틀 참가 요청
 */
export interface BattleJoinRequest {
  battleId: string;
  team: BattleTeam;
  password?: string;
}

/**
 * 배틀 목록 조회 요청
 */
export interface BattleListRequest {
  limit: number;
  offset: number;
}

/**
 * 공격 생성 요청
 */
export interface AttackCreateRequest {
  battleId: string;
  content: string;
  team: BattleTeam;
}

/**
 * 방어 생성 요청
 */
export interface DefenseCreateRequest {
  battleId: string;
  content: string;
  team: BattleTeam;
}

/**
 * 공격 투표 요청
 */
export interface AttackVoteRequest {
  battleId: string;
  discussionId: string;
  team: BattleTeam;
}

/**
 * 방어 투표 요청
 */
export interface DefenseVoteRequest {
  battleId: string;
  discussionId: string;
  team: BattleTeam;
}
