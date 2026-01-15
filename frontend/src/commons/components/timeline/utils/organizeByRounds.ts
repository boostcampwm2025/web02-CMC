import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

export interface RoundData {
  round: number;
  topic: string;
  isActive: boolean;
  isFuture: boolean;
  challenge: {
    teamA: BattleDiscussion | null;
    teamB: BattleDiscussion | null;
  };
  rebuttal: {
    teamA: BattleDefense | null;
    teamB: BattleDefense | null;
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

  // attacks와 defenses 분리
  const attacks = timelines.filter((item) => item.type === 'ATTACK') as BattleDiscussion[];
  const defenses = timelines.filter((item) => item.type === 'DEFENSE') as BattleDefense[];

  for (let i = 1; i <= totalRounds; i++) {
    // 각 라운드는 A팀, B팀 순서로 2개씩 저장됨
    const aAttackIdx = (i - 1) * 2;
    const bAttackIdx = (i - 1) * 2 + 1;
    const aDefenseIdx = (i - 1) * 2;
    const bDefenseIdx = (i - 1) * 2 + 1;

    const challengeA = attacks[aAttackIdx] || null;
    const challengeB = attacks[bAttackIdx] || null;
    const rebuttalA = (defenses[aDefenseIdx] as BattleDefense) || null;
    const rebuttalB = (defenses[bDefenseIdx] as BattleDefense) || null;

    rounds.push({
      round: i,
      topic: topics[i - 1],
      isActive: i === currentRound,
      isFuture: i > currentRound,
      challenge: {
        teamA: challengeA,
        teamB: challengeB
      },
      rebuttal: {
        teamA: rebuttalA,
        teamB: rebuttalB
      }
    });
  }

  return rounds;
}
