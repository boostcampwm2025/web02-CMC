import type {
  BattleChat,
  BattleDefense,
  BattleDiscussion,
  BattlePhaseName,
  BattleStatus,
  BattleCategory,
  BattleLanguage,
  BattleTeam,
  TeamCounts,
  BattleResult,
  Metrics,
  VoteTimeline,
  TimelineItem,
  Mvp
} from './index.js';

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
 * 배틀 목록 페이지네이션 응답
 */
export interface BattleListResponse {
  battles: BattleListItemResponse[];
  meta: {
    offset: number;
    limit: number;
    total: number;
  };
}

/**
 * 배틀 결과 응답
 */
export interface BattleResultResponse {
  battleId: string;
  authorId: string;
  title: string;
  description: string;
  status: 'CLOSED';
  language: string;
  category: string;
  playTime: number;
  topics: string[];
  createdAt: string;
  finishedAt: string;
  codeA: string;
  codeB: string;
  result: BattleResult;
  metrics: Metrics;
  voteTimeline: VoteTimeline[];
  timeline: TimelineItem[];
  mvp: Mvp;
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
 * 토론 투표 결과 아이템
 */
export interface DiscussionVoteResultItem {
  id: string | null;
  text: string | null;
  ownerId: string | null;
  nickname: string | null;
  count: number | null;
  team: BattleTeam | null;
}

/**
 * 공격 투표 결과 응답 (battle:attacked)
 */
export interface BattleAttackedResponse {
  battleId: string;
  attack: {
    aTeam: DiscussionVoteResultItem;
    bTeam: DiscussionVoteResultItem;
  };
}

/**
 * 방어 투표 결과 응답 (battle:defensed)
 */
export interface BattleDefensedResponse {
  battleId: string;
  defense: {
    aTeam: DiscussionVoteResultItem;
    bTeam: DiscussionVoteResultItem;
  };
}

/**
 * 배틀 종료 응답
 */
export interface BattleClosedResponse {
  battleId: string;
}

/**
 * 팀 변경 응답 (개별 사용자)
 */
export interface BattleTeamUpdatedResponse {
  battleId: string;
  team: BattleTeam;
}

/**
 * 배틀 퇴장 응답
 */
export interface BattleLeaveResponse {
  battleId: string;
  counts: TeamCounts;
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

/**
 * 채팅 전송 요청 (battle:chat)
 */
export interface BattleChatRequest {
  battleId: string;
  scope: 'ALL' | 'TEAM';
  team: BattleTeam;
  text: string;
}

/**
 * 배틀 전체 팀 변경 응답 (battle:all:updated)
 */
export interface BattleTeamUpdateAllResponse {
  battleId: string;
  round: number;
  before: TeamCounts;
  after: TeamCounts;
  changes: Array<{
    userId: string;
    from: BattleTeam;
    to: BattleTeam;
  }>;
  difference: {
    teamA: number;
    teamB: number;
    teamNone: number;
  };
  dominantTeam: BattleTeam | null;
}
