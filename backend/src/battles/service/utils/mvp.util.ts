import { Mvp } from '../../types/battleResult.types'

/** 승리 팀 보너스 배율 */
export const WINNER_TEAM_BONUS_MULTIPLIER = 1.5

/**
 * 의견별 점수를 계산한다
 * 점수 = 좋아요 수 / 해당 팀 투표 참가자 수
 * 투표 참가자가 0명이면 0점
 */
export function calculateOpinionScore(upvotes: number, voterCount: number): number {
  if (voterCount === 0) return 0
  return upvotes / voterCount
}

/**
 * 승리 팀 보너스를 적용한 최종 점수를 계산한다
 * 승리 팀에 속한 후보자는 누적 점수에 1.5배 보너스를 받는다
 * 무승부 또는 중립(NONE) 팀인 경우 보너스 없음
 */
export function applyWinnerBonus(score: number, team: 'A' | 'B' | 'NONE', winner: 'A' | 'B' | 'DRAW'): number {
  return team === winner ? score * WINNER_TEAM_BONUS_MULTIPLIER : score
}

/** MVP 비교 함수 타입 */
type MvpComparator = (a: Mvp, b: Mvp) => number

const compareByScore: MvpComparator = (a, b) => b.score - a.score
const compareByTotalVotes: MvpComparator = (a, b) => b.totalVotes - a.totalVotes
const compareByOpinionCount: MvpComparator = (a, b) => b.opinionCount - a.opinionCount
const compareBySelectedOpinionCount: MvpComparator = (a, b) => b.selectedOpinionCount - a.selectedOpinionCount
const compareByJoinedAt: MvpComparator = (a, b) => a.joinedAt - b.joinedAt

const compareByWinnerTeam = (winner: 'A' | 'B' | 'DRAW'): MvpComparator => {
  return (a, b) => {
    if (winner === 'DRAW') return 0
    const aIsWinner = a.team === winner
    const bIsWinner = b.team === winner
    if (aIsWinner === bIsWinner) return 0
    return aIsWinner ? -1 : 1
  }
}

/**
 * MVP 후보자 비교 함수 (정렬용)
 * 우선순위:
 * 1. 누적 점수 (높을수록 우선)
 * 2. 총 좋아요 수 (높을수록 우선)
 * 3. 의견 제출 수 (높을수록 우선)
 * 4. 승리 팀 소속 (승리팀 우선)
 * 5. 선정된 의견 수 (높을수록 우선)
 * 6. 먼저 참여한 순서 (빠를수록 우선)
 *
 * @returns 음수: a 우선, 양수: b 우선, 0: 동일
 */
export function compareMvpCandidates(a: Mvp, b: Mvp, winner: 'A' | 'B' | 'DRAW'): number {
  const comparators: MvpComparator[] = [
    compareByScore,
    compareByTotalVotes,
    compareByOpinionCount,
    compareByWinnerTeam(winner),
    compareBySelectedOpinionCount,
    compareByJoinedAt,
  ]

  for (const compare of comparators) {
    const result = compare(a, b)
    if (result !== 0) return result
  }

  return 0
}

/**
 * MVP 후보 객체 생성 팩토리 메서드
 * 매개변수가 없으면 초기화된 빈 객체를, 매개변수가 있으면 해당 값으로 채워진 객체를 반환
 */
export function createMvpCandidate(data?: Partial<Mvp>): Mvp {
  const defaults: Mvp = {
    userId: '',
    nickname: 'unknown',
    team: 'A',
    score: 0,
    totalVotes: 0,
    opinionCount: 0,
    selectedOpinionCount: 0,
    joinedAt: 0,
  }

  if (!data) return defaults

  return { ...defaults, ...data }
}

/**
 * 빈 MVP 객체 생성
 * @deprecated createMvpCandidate() 사용을 권장
 */
export function createEmptyMvp(): Mvp {
  return createMvpCandidate()
}
