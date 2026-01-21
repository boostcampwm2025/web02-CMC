import type { BattleDiscussion } from '@cmc/types';
import type { BattleDefense } from '@/commons/types/battle';

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
 * 배열 저장 순서: attacks[A팀, B팀, A팀, B팀], defenses[A팀, B팀, A팀, B팀]
 * - defenses의 인덱스는 반론을 작성한 팀 (공격받은 팀이 아님!)
 *
 * 한 라운드 = 4개의 공수 전환
 * - 1차: A 이의제기(attacks[0]) → B 반론(defenses[1]) / B 이의제기(attacks[1]) → A 반론(defenses[0])
 * - 2차: A 이의제기(attacks[2]) → B 반론(defenses[3]) / B 이의제기(attacks[3]) → A 반론(defenses[2])
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
      attackA: timelines?.attacks[roundIndex] || null, // A팀 1차 공격
      defenseB: timelines?.defenses[roundIndex + 1] || null, // B팀 1차 반론 (A공격에 대한)
      attackB: timelines?.attacks[roundIndex + 1] || null, // B팀 1차 공격
      defenseA: timelines?.defenses[roundIndex] || null // A팀 1차 반론 (B공격에 대한)
    },
    turn2: {
      attackA: timelines?.attacks[roundIndex + 2] || null, // A팀 2차 공격
      defenseB: timelines?.defenses[roundIndex + 3] || null, // B팀 2차 반론 (A공격에 대한)
      attackB: timelines?.attacks[roundIndex + 3] || null, // B팀 2차 공격
      defenseA: timelines?.defenses[roundIndex + 2] || null // A팀 2차 반론 (B공격에 대한)
    }
  };
};
