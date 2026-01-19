import { Mvp } from '../../types/battleResult.types'

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
  // 1. 누적 점수
  if (a.score !== b.score) {
    return b.score - a.score
  }

  // 2. 총 좋아요 수
  if (a.totalVotes !== b.totalVotes) {
    return b.totalVotes - a.totalVotes
  }

  // 3. 의견 제출 수
  if (a.opinionCount !== b.opinionCount) {
    return b.opinionCount - a.opinionCount
  }

  // 4. 승리 팀 소속 (무승부면 건너뜀)
  if (winner !== 'DRAW') {
    const aIsWinner = a.team === winner
    const bIsWinner = b.team === winner
    if (aIsWinner !== bIsWinner) {
      return aIsWinner ? -1 : 1
    }
  }

  // 5. 선정된 의견 수
  if (a.selectedOpinionCount !== b.selectedOpinionCount) {
    return b.selectedOpinionCount - a.selectedOpinionCount
  }

  // 6. 먼저 참여한 순서
  if (a.joinedAt !== b.joinedAt) {
    return a.joinedAt - b.joinedAt
  }

  return 0
}

/**
 * 빈 MVP 객체 생성
 */
export function createEmptyMvp(): Mvp {
  return {
    userId: '',
    nickname: 'unknown',
    team: 'A',
    score: 0,
    totalVotes: 0,
    opinionCount: 0,
    selectedOpinionCount: 0,
    joinedAt: 0,
  }
}
