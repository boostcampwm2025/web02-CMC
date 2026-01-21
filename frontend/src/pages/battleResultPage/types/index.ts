import type { BattleResult, Metrics, VoteTimeline, TimelineItem, Mvp } from '@cmc/types';

export interface BattleResultApiResponse {
  battleId: string;
  authorId: string;
  title: string;
  description: string;
  codeA: string;
  codeB: string;
  language: string;
  status: 'CLOSED';
  category: string;
  playTime: number;
  createdAt: string;
  finishedAt: string;
  result: BattleResult;
  metrics: Metrics;
  voteTimeline: VoteTimeline[];
  timeline: TimelineItem[];
  topics: string[];
  mvp: Mvp;
}
