import { BattleResultService } from './battleResult.service'

describe('BattleResultService', () => {
  let service: BattleResultService

  beforeEach(() => {
    service = new BattleResultService()
  })

  describe('determineWinningTeam', () => {
    it('A팀 투표가 많으면 A를 반환한다', () => {
      expect(service.determineWinningTeam(5, 3)).toBe('A')
    })

    it('B팀 투표가 많으면 B를 반환한다', () => {
      expect(service.determineWinningTeam(3, 5)).toBe('B')
    })

    it('동점이면 DRAW를 반환한다', () => {
      expect(service.determineWinningTeam(5, 5)).toBe('DRAW')
    })

    it('둘 다 0이면 DRAW를 반환한다', () => {
      expect(service.determineWinningTeam(0, 0)).toBe('DRAW')
    })
  })

  describe('buildBattleResult', () => {
    it('투표 수와 퍼센트를 포함한 결과를 반환한다', () => {
      const result = service.buildBattleResult(6, 4)
      expect(result.winner).toBe('A')
      expect(result.teamA).toEqual({ votes: 6, percentage: 60 })
      expect(result.teamB).toEqual({ votes: 4, percentage: 40 })
      expect(result.neutral).toEqual({ votes: 0, percentage: 0 })
    })

    it('totalParticipantsCount가 주어지면 중립 투표를 계산한다', () => {
      const result = service.buildBattleResult(3, 2, 10)
      expect(result.neutral).toEqual({ votes: 5, percentage: 50 })
    })

    it('winningTeam이 주어지면 해당 값을 사용한다', () => {
      const result = service.buildBattleResult(3, 5, null, 'DRAW')
      expect(result.winner).toBe('DRAW')
    })

    it('total이 0이면 모든 퍼센트가 0이다', () => {
      const result = service.buildBattleResult(0, 0)
      expect(result.teamA.percentage).toBe(0)
      expect(result.teamB.percentage).toBe(0)
      expect(result.neutral.percentage).toBe(0)
    })
  })

  describe('toBattleResultForTeam', () => {
    it('NONE 팀은 null을 반환한다', () => {
      expect(service.toBattleResultForTeam('NONE', 'A')).toBeNull()
    })

    it('DRAW이면 DRAW를 반환한다', () => {
      expect(service.toBattleResultForTeam('A', 'DRAW')).toBe('DRAW')
      expect(service.toBattleResultForTeam('B', 'DRAW')).toBe('DRAW')
    })

    it('A팀이 승리하면 A팀은 WIN, B팀은 LOSE를 반환한다', () => {
      expect(service.toBattleResultForTeam('A', 'A')).toBe('WIN')
      expect(service.toBattleResultForTeam('B', 'A')).toBe('LOSE')
    })

    it('B팀이 승리하면 B팀은 WIN, A팀은 LOSE를 반환한다', () => {
      expect(service.toBattleResultForTeam('B', 'B')).toBe('WIN')
      expect(service.toBattleResultForTeam('A', 'B')).toBe('LOSE')
    })
  })
})
