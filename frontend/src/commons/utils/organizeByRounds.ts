import type { BattleDiscussion } from '@cmc/types';
import type { BattleDefense } from '@/commons/types/battle';

export interface RoundData {
  round: string;
  topic: string;
  isActive: boolean;
  isFuture: boolean;
  challenge1: {
    teamA: BattleDiscussion | null;
    teamB: BattleDefense | null;
  };
  challenge2: {
    teamB: BattleDiscussion | null;
    teamA: BattleDefense | null;
  };
  challenge3: {
    teamA: BattleDiscussion | null;
    teamB: BattleDefense | null;
  };
  challenge4: {
    teamB: BattleDiscussion | null;
    teamA: BattleDefense | null;
  };
}
