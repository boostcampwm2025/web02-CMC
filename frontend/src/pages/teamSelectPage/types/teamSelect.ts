export type Step = 1 | 2 | 3 | 4 | 5;

export interface TimelineItem {
  id: string;
  type: 'ATTACK' | 'DEFENSE';
  team: 'A' | 'B';
  author: string;
  content: string;
  upvotes: number;
  timestamp: number;
  attackId?: string; // 반론인 경우 어떤 이의제기에 대한 것인지
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
