export type Team = 'A' | 'B' | 'NONE';

export type Step = 1 | 2 | 3 | 4;

export interface TimelineItem {
  id: string;
  type: 'ATTACK' | 'DEFENSE';
  team: 'A' | 'B';
  author: string;
  content: string;
  upvotes: number;
  timestamp: number;
}

export interface BattleInfo {
  title: string;
  description: string;
  category: string;
  language: string;
  aCode: string;
  bCode: string;
  currentRound: number;
  totalRounds: number;
  totalParticipants: number;
}
