import type { BattleDiscussionType, BattleTeam } from '@cmc/types';

export type Step = 1 | 2 | 3 | 4;

// teamSelectPage 전용 TimelineItem (구조가 @cmc/types와 다름)
export interface TimelineItem {
  id: string;
  type: BattleDiscussionType;
  team: Exclude<BattleTeam, 'NONE'>;
  author: string;
  content: string;
  upvotes: number;
  timestamp: number;
  attackId?: string; // 반론인 경우 어떤 이의제기에 대한 것인지
}
