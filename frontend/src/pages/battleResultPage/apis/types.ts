import type { Team } from '@/commons/types/battle';

export interface VoteResult {
  votes: number;
  percentage: number;
}

export interface BattleResult {
  winner: Exclude<Team, 'NONE'> | 'DRAW';
  teamA: VoteResult;
  teamB: VoteResult;
  neutral: VoteResult;
}

export interface Metrics {
  totalParticipants: number;
  totalViews: number;
  strategiesCount: number;
}

export interface VoteTimelineItem {
  turn: number;
  teamAVotes: number;
  teamBVotes: number;
  neutralVotes: number;
  timestamp: string;
}

export interface TimelineAuthor {
  id: string;
  nickname: string;
}

export type DiscussionType = 'ATTACK' | 'DEFENSE';

export interface TimelineItem {
  id: string;
  type: DiscussionType;
  author: TimelineAuthor;
  team: Exclude<Team, 'NONE'>;
  content: string;
  turn: number;
  upvotes: number;
  createdAt: string;
}

export interface Mvp {
  userId: string;
  nickname: string;
  team: Exclude<Team, 'NONE'>;
  score: number;
  totalVotes: number;
  opinionCount: number;
  selectedOpinionCount: number;
  joinedAt: number;
}

export interface BattleResultApiResponse {
  battleId: string;
  author: string;
  title: string;
  description: string;
  codeA: string;
  codeB: string;
  language: string;
  type: string;
  status: 'CLOSED';
  category: string;
  playTime: string;
  createdAt: string;
  finishedAt: string;
  result: BattleResult;
  metrics: Metrics;
  voteTimeline: VoteTimelineItem[];
  timeline: TimelineItem[];
  topics: string[];
  mvps: Mvp[];
}

export function isBattleResultApiResponse(data: unknown): data is BattleResultApiResponse {
  if (typeof data !== 'object' || data === null) return false;

  const response = data as Record<string, unknown>;

  return (
    typeof response.battleId === 'string' &&
    typeof response.title === 'string' &&
    typeof response.status === 'string' &&
    typeof response.result === 'object' &&
    typeof response.metrics === 'object' &&
    Array.isArray(response.voteTimeline) &&
    Array.isArray(response.timeline) &&
    Array.isArray(response.mvps)
  );
}
