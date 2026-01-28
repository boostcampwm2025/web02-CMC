import { Mvp } from '../../types/battleResult.types'
import {
  calculateOpinionScore,
  compareMvpCandidates,
  createEmptyMvp,
  createMvpCandidate,
  applyWinnerBonus,
  WINNER_TEAM_BONUS_MULTIPLIER,
} from './mvp.util'

describe('MVP Utils', () => {
  describe('calculateOpinionScore', () => {
    it('좋아요 수를 투표 참가자 수로 나눈 점수를 반환한다', () => {
      const score = calculateOpinionScore(5, 10)
      expect(score).toBe(0.5)
    })

    it('투표 참가자가 0명이면 0점을 반환한다', () => {
      const score = calculateOpinionScore(5, 0)
      expect(score).toBe(0)
    })

    it('좋아요가 0이면 0점을 반환한다', () => {
      const score = calculateOpinionScore(0, 10)
      expect(score).toBe(0)
    })

    it('모든 투표자가 좋아요를 누르면 1점을 반환한다', () => {
      const score = calculateOpinionScore(10, 10)
      expect(score).toBe(1)
    })
  })

  describe('compareMvpCandidates', () => {
    const baseCandidate: Mvp = {
      userId: 'user-1',
      nickname: 'User1',
      team: 'A',
      score: 1.0,
      totalVotes: 10,
      opinionCount: 5,
      selectedOpinionCount: 2,
      joinedAt: 1000,
    }

    it('점수가 높은 후보가 우선이다', () => {
      const higher: Mvp = { ...baseCandidate, score: 2.0 }
      const lower: Mvp = { ...baseCandidate, score: 1.0 }

      expect(compareMvpCandidates(higher, lower, 'A')).toBeLessThan(0)
      expect(compareMvpCandidates(lower, higher, 'A')).toBeGreaterThan(0)
    })

    it('점수가 같으면 총 좋아요 수가 많은 후보가 우선이다', () => {
      const moreVotes: Mvp = { ...baseCandidate, totalVotes: 20 }
      const lessVotes: Mvp = { ...baseCandidate, totalVotes: 10 }

      expect(compareMvpCandidates(moreVotes, lessVotes, 'A')).toBeLessThan(0)
      expect(compareMvpCandidates(lessVotes, moreVotes, 'A')).toBeGreaterThan(0)
    })

    it('좋아요 수도 같으면 의견 제출 수가 많은 후보가 우선이다', () => {
      const moreOpinions: Mvp = { ...baseCandidate, opinionCount: 10 }
      const lessOpinions: Mvp = { ...baseCandidate, opinionCount: 5 }

      expect(compareMvpCandidates(moreOpinions, lessOpinions, 'A')).toBeLessThan(0)
      expect(compareMvpCandidates(lessOpinions, moreOpinions, 'A')).toBeGreaterThan(0)
    })

    it('의견 수도 같으면 승리 팀 소속이 우선이다', () => {
      const winnerTeam: Mvp = { ...baseCandidate, team: 'A' }
      const loserTeam: Mvp = { ...baseCandidate, team: 'B' }

      expect(compareMvpCandidates(winnerTeam, loserTeam, 'A')).toBeLessThan(0)
      expect(compareMvpCandidates(loserTeam, winnerTeam, 'A')).toBeGreaterThan(0)
    })

    it('승리 팀도 같으면 선정된 의견 수가 많은 후보가 우선이다', () => {
      const moreSelected: Mvp = { ...baseCandidate, selectedOpinionCount: 5 }
      const lessSelected: Mvp = { ...baseCandidate, selectedOpinionCount: 2 }

      expect(compareMvpCandidates(moreSelected, lessSelected, 'A')).toBeLessThan(0)
      expect(compareMvpCandidates(lessSelected, moreSelected, 'A')).toBeGreaterThan(0)
    })

    it('선정된 의견 수도 같으면 먼저 참여한 후보가 우선이다', () => {
      const earlier: Mvp = { ...baseCandidate, joinedAt: 500 }
      const later: Mvp = { ...baseCandidate, joinedAt: 1000 }

      expect(compareMvpCandidates(earlier, later, 'A')).toBeLessThan(0)
      expect(compareMvpCandidates(later, earlier, 'A')).toBeGreaterThan(0)
    })

    it('모든 조건이 같으면 0을 반환한다', () => {
      const candidate1: Mvp = { ...baseCandidate }
      const candidate2: Mvp = { ...baseCandidate }

      expect(compareMvpCandidates(candidate1, candidate2, 'A')).toBe(0)
    })

    it('무승부일 경우 승리 팀 비교를 건너뛴다', () => {
      const teamA: Mvp = { ...baseCandidate, team: 'A' }
      const teamB: Mvp = { ...baseCandidate, team: 'B' }

      // DRAW일 때는 팀 비교가 의미 없으므로 다음 조건으로 넘어감
      expect(compareMvpCandidates(teamA, teamB, 'DRAW')).toBe(0)
    })
  })

  describe('createMvpCandidate', () => {
    it('매개변수 없이 호출하면 기본값으로 채워진 객체를 반환한다', () => {
      const mvp = createMvpCandidate()

      expect(mvp).toEqual({
        userId: '',
        nickname: 'unknown',
        team: 'A',
        score: 0,
        totalVotes: 0,
        opinionCount: 0,
        selectedOpinionCount: 0,
        joinedAt: 0,
      })
    })

    it('일부 값만 전달하면 나머지는 기본값으로 채워진다', () => {
      const mvp = createMvpCandidate({ userId: 'user-1', nickname: 'TestUser' })

      expect(mvp.userId).toBe('user-1')
      expect(mvp.nickname).toBe('TestUser')
      expect(mvp.team).toBe('A')
      expect(mvp.score).toBe(0)
    })

    it('모든 값을 전달하면 해당 값으로 객체가 생성된다', () => {
      const data: Mvp = {
        userId: 'user-1',
        nickname: 'MVP',
        team: 'B',
        score: 2.5,
        totalVotes: 25,
        opinionCount: 3,
        selectedOpinionCount: 2,
        joinedAt: 1000,
      }

      const mvp = createMvpCandidate(data)

      expect(mvp).toEqual(data)
    })
  })

  describe('createEmptyMvp (deprecated)', () => {
    it('빈 MVP 객체를 생성한다', () => {
      const emptyMvp = createEmptyMvp()

      expect(emptyMvp).toEqual({
        userId: '',
        nickname: 'unknown',
        team: 'A',
        score: 0,
        totalVotes: 0,
        opinionCount: 0,
        selectedOpinionCount: 0,
        joinedAt: 0,
      })
    })
  })

  describe('applyWinnerBonus', () => {
    it('승리 팀에 1.5배 보너스를 적용한다', () => {
      const score = applyWinnerBonus(1.0, 'A', 'A')
      expect(score).toBe(1.0 * WINNER_TEAM_BONUS_MULTIPLIER)
      expect(score).toBe(1.5)
    })

    it('패배 팀에는 보너스를 적용하지 않는다', () => {
      const score = applyWinnerBonus(1.0, 'B', 'A')
      expect(score).toBe(1.0)
    })

    it('무승부인 경우 보너스를 적용하지 않는다', () => {
      const scoreA = applyWinnerBonus(1.0, 'A', 'DRAW')
      const scoreB = applyWinnerBonus(1.0, 'B', 'DRAW')
      expect(scoreA).toBe(1.0)
      expect(scoreB).toBe(1.0)
    })

    it('B팀이 승리한 경우 B팀에 보너스를 적용한다', () => {
      const scoreA = applyWinnerBonus(1.0, 'A', 'B')
      const scoreB = applyWinnerBonus(1.0, 'B', 'B')
      expect(scoreA).toBe(1.0)
      expect(scoreB).toBe(1.5)
    })

    it('점수가 0이면 보너스 적용해도 0이다', () => {
      const score = applyWinnerBonus(0, 'A', 'A')
      expect(score).toBe(0)
    })

    it('소수점 점수에도 정확히 1.5배를 적용한다', () => {
      const score = applyWinnerBonus(0.7, 'A', 'A')
      expect(score).toBeCloseTo(1.05)
    })

    it('중립(NONE) 팀에는 보너스를 적용하지 않는다', () => {
      const scoreWhenAWins = applyWinnerBonus(1.0, 'NONE', 'A')
      const scoreWhenBWins = applyWinnerBonus(1.0, 'NONE', 'B')
      const scoreWhenDraw = applyWinnerBonus(1.0, 'NONE', 'DRAW')
      expect(scoreWhenAWins).toBe(1.0)
      expect(scoreWhenBWins).toBe(1.0)
      expect(scoreWhenDraw).toBe(1.0)
    })
  })
})
