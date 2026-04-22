import type { BattleTeam } from '@/commons/types/battle';

export interface VoteResult {
  votes: number;
  percentage: number;
}

export interface BattleResult {
  winner: Exclude<BattleTeam, 'NONE'> | 'DRAW';
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
  team: Exclude<BattleTeam, 'NONE'>;
  content: string;
  turn: number;
  upvotes: number;
  createdAt: string;
}

export interface Mvp {
  userId: string;
  nickname: string;
  team: BattleTeam;
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
