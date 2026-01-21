import type { TimelineItem } from '@cmc/types';

interface OrganizeTimelineParams {
  timelines: TimelineItem[];
  topics: string[];
}

interface RoundData {
  round: string;
  topic: string;
  isActive: boolean;
  isFuture: boolean;
  challenge: {
    teamA: TimelineItem | null;
    teamB: TimelineItem | null;
  };
  rebuttal: {
    teamA: TimelineItem | null;
    teamB: TimelineItem | null;
  };
}

// 타임라인을 라운드별로 정리하는 함수

export function organizeTimelineByRounds({ timelines, topics }: OrganizeTimelineParams): RoundData[] {
  // 턴별로 그룹화 (각 턴이 1개의 카드)
  const turnMap = new Map<number, TimelineItem[]>();

  timelines.forEach((item) => {
    if (!turnMap.has(item.turn)) {
      turnMap.set(item.turn, []);
    }
    turnMap.get(item.turn)!.push(item);
  });

  // 턴 번호 정렬
  const sortedTurns = Array.from(turnMap.keys()).sort((a, b) => a - b);

  return sortedTurns.map((turn) => {
    const items = turnMap.get(turn) || [];

    // 턴 1,2 → 라운드 1 / 턴 3,4 → 라운드 2
    const roundNumber = Math.ceil(turn / 2);
    const subRound = turn % 2 === 1 ? 1 : 2;

    // 타입과 팀별로 분류
    const attacks = items.filter((item) => item.type === 'ATTACK');
    const defenses = items.filter((item) => item.type === 'DEFENSE');

    const challengeA = attacks.find((item) => item.team === 'A') || null;
    const challengeB = attacks.find((item) => item.team === 'B') || null;
    const rebuttalA = defenses.find((item) => item.team === 'A') || null;
    const rebuttalB = defenses.find((item) => item.team === 'B') || null;

    return {
      round: `${roundNumber}-${subRound}`,
      topic: topics[roundNumber - 1] || `라운드 ${roundNumber}`,
      isActive: true,
      isFuture: false,
      challenge: {
        teamA: challengeA,
        teamB: challengeB
      },
      rebuttal: {
        teamA: rebuttalA,
        teamB: rebuttalB
      }
    };
  });
}
