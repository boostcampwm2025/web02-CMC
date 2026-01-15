import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

/**
 * 한 라운드의 타임라인 데이터 구조
 */
export interface RoundTimelineData {
  turn1: {
    attackA: BattleDiscussion | null;
    defenseB: BattleDefense | null;
    attackB: BattleDiscussion | null;
    defenseA: BattleDefense | null;
  };
  turn2: {
    attackA: BattleDiscussion | null;
    defenseB: BattleDefense | null;
    attackB: BattleDiscussion | null;
    defenseA: BattleDefense | null;
  };
}

/**
 * 현재 라운드의 타임라인 데이터를 추출
 *
 * @param currentRound - 현재 라운드 번호 (1부터 시작)
 * @param timelines - 전체 타임라인 데이터 (attacks, defenses 배열)
 * @returns 현재 라운드의 8개 메시지 (2턴 × 4개)
 *
 * @remarks
 * 한 라운드 = 4개의 공수 전환
 * - 1차 공수: A 이의제기(attacks[0]) → B 반론(defenses[0])
 * - 1차 역공: B 이의제기(attacks[1]) → A 반론(defenses[1])
 * - 2차 공수: A 이의제기(attacks[2]) → B 반론(defenses[2])
 * - 2차 역공: B 이의제기(attacks[3]) → A 반론(defenses[3])
 *
 * 라운드 N의 시작 인덱스 = (N - 1) × 4
 */
export const getTimelineData = (
  currentRound: number,
  timelines: { attacks: BattleDiscussion[]; defenses: BattleDefense[] } | null
): RoundTimelineData => {
  const roundIndex = (currentRound - 1) * 4;

  return {
    turn1: {
      attackA: timelines?.attacks[roundIndex] || null,
      defenseB: timelines?.defenses[roundIndex] || null,
      attackB: timelines?.attacks[roundIndex + 1] || null,
      defenseA: timelines?.defenses[roundIndex + 1] || null
    },
    turn2: {
      attackA: timelines?.attacks[roundIndex + 2] || null,
      defenseB: timelines?.defenses[roundIndex + 2] || null,
      attackB: timelines?.attacks[roundIndex + 3] || null,
      defenseA: timelines?.defenses[roundIndex + 3] || null
    }
  };
};
