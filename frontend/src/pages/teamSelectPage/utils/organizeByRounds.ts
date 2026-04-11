import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

export interface ChallengeData {
  attackTeam: 'A' | 'B';
  phase: 1 | 2;
  challengeMessage: BattleDiscussion | null;
  rebuttalMessage: BattleDefense | null;
}

export interface RoundData {
  round: number;
  topic: string;
  isActive: boolean;
  isFuture: boolean;
  challenges: ChallengeData[];
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
  const attacks = timelines.filter((item) => item.type === 'ATTACK') as BattleDiscussion[];
  const defenses = timelines.filter((item) => item.type === 'DEFENSE') as BattleDefense[];

  return Array.from({ length: totalRounds }, (_, idx) => {
    const i = idx + 1;
    const base = idx * 4;

    return {
      round: i,
      topic: topics[idx],
      isActive: i === currentRound,
      isFuture: i > currentRound,
      challenges: [
        { attackTeam: 'A', phase: 1, challengeMessage: attacks[base] ?? null, rebuttalMessage: defenses[base] ?? null },
        {
          attackTeam: 'B',
          phase: 1,
          challengeMessage: attacks[base + 1] ?? null,
          rebuttalMessage: defenses[base + 1] ?? null
        },
        {
          attackTeam: 'A',
          phase: 2,
          challengeMessage: attacks[base + 2] ?? null,
          rebuttalMessage: defenses[base + 2] ?? null
        },
        {
          attackTeam: 'B',
          phase: 2,
          challengeMessage: attacks[base + 3] ?? null,
          rebuttalMessage: defenses[base + 3] ?? null
        }
      ] satisfies ChallengeData[]
    };
  });
}
