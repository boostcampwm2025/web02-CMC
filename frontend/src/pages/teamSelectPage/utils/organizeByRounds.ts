import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

export interface RoundData {
  round: number;
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

interface OrganizeByRoundsParams {
  timelines: Array<BattleDiscussion | BattleDefense>;
  topics: string[];
  currentRound: number;
  totalRounds: number;
}

export function organizeByRounds({
  timelines,
  topics,
  currentRound,
  totalRounds
}: OrganizeByRoundsParams): RoundData[] {
  const rounds: RoundData[] = [];

  const attacks = timelines.filter((item) => item.type === 'ATTACK') as BattleDiscussion[];
  const defenses = timelines.filter((item) => item.type === 'DEFENSE') as BattleDefense[];

  for (let i = 1; i <= totalRounds; i++) {
    const baseIdx = (i - 1) * 4;

    rounds.push({
      round: i,
      topic: topics[i - 1],
      isActive: i === currentRound,
      isFuture: i > currentRound,
      challenge1: {
        teamA: attacks[baseIdx] ?? null,
        teamB: (defenses[baseIdx] as BattleDefense) ?? null
      },
      challenge2: {
        teamB: attacks[baseIdx + 1] ?? null,
        teamA: (defenses[baseIdx + 1] as BattleDefense) ?? null
      },
      challenge3: {
        teamA: attacks[baseIdx + 2] ?? null,
        teamB: (defenses[baseIdx + 2] as BattleDefense) ?? null
      },
      challenge4: {
        teamB: attacks[baseIdx + 3] ?? null,
        teamA: (defenses[baseIdx + 3] as BattleDefense) ?? null
      }
    });
  }

  return rounds;
}
