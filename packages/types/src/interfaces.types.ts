import type {
  BattleTeam,
  BattleDiscussionType,
  BattleDiscussionStatus,
  BattleChatScope,
} from './common.types';

/**
 * 배틀 채팅 메시지
 */
export interface BattleChat {
  battleId: string;
  messageId: string;
  team: BattleTeam;
  sender: {
    userId: string;
    nickname: string;
  };
  text: string;
  createdAt: Date;
  scope: BattleChatScope;
}

/**
 * 배틀 토론 (공격/방어)
 */
export interface BattleDiscussion {
  discussionId: string;
  author: {
    authorId: string;
    nickname: string;
  };
  type: BattleDiscussionType;
  content: string;
  upvotes: number;
  votes: string[];
  status: BattleDiscussionStatus;
  selectedAt?: number;
  team: BattleTeam;
}

/**
 * 배틀 방어 (Discussion과 동일)
 */
export type BattleDefense = BattleDiscussion;

/**
 * 타임라인 아이템
 */
export interface TimelineItem {
  id: string;
  type: 'ATTACK' | 'DEFENSE';
  author: {
    id: string;
    nickname: string;
  };
  team: 'A' | 'B';
  content: string;
  turn: number;
  upvotes: number;
  createdAt: string;
}

/**
 * 투표 결과
 */
export interface VoteResult {
  votes: number;
  percentage: number;
}

/**
 * 배틀 최종 결과
 */
export interface BattleResult {
  winner: 'A' | 'B' | 'DRAW';
  teamA: VoteResult;
  teamB: VoteResult;
  neutral: VoteResult;
}

/**
 * 최우수 참가자
 */
export interface Mvp {
  userId: string;
  nickname: string;
  team: 'A' | 'B';
  totalVotes: number;
}

/**
 * 배틀 통계
 */
export interface Metrics {
  totalParticipants: number;
  totalViews: number;
  strategiesCount: number;
  totalChats: number;
}

/**
 * 시간대별 투표 현황
 */
export interface VoteTimeline {
  turn: number;
  teamAVotes: number;
  teamBVotes: number;
  neutralVotes: number;
  timestamp: string;
}

/**
 * 팀별 인원 수
 */
export interface TeamCounts {
  teamA: number;
  teamB: number;
  teamNone: number;
}

/**
 * 팀 변경 정보
 */
export interface TeamChange {
  userId: string;
  from: BattleTeam;
  to: BattleTeam;
}
