import { coerceTierName, getTierFromRating, getWinDrawMultiplier, calculateRatingDelta, getMvpBonus } from './rating.util'

describe('Rating Utils', () => {
  describe('coerceTierName', () => {
    it('유효한 티어 이름을 그대로 반환한다', () => {
      expect(coerceTierName('BRONZE')).toBe('BRONZE')
      expect(coerceTierName('SILVER')).toBe('SILVER')
      expect(coerceTierName('GOLD')).toBe('GOLD')
      expect(coerceTierName('DIAMOND')).toBe('DIAMOND')
      expect(coerceTierName('MASTER')).toBe('MASTER')
      expect(coerceTierName('GRANDMASTER')).toBe('GRANDMASTER')
    })

    it('유효하지 않은 티어 이름은 BRONZE를 반환한다', () => {
      expect(coerceTierName('INVALID')).toBe('BRONZE')
      expect(coerceTierName('')).toBe('BRONZE')
    })

    it('null이나 undefined는 BRONZE를 반환한다', () => {
      expect(coerceTierName(null)).toBe('BRONZE')
      expect(coerceTierName(undefined)).toBe('BRONZE')
    })
  })

  describe('getTierFromRating', () => {
    it('레이팅 구간에 따라 올바른 티어를 반환한다', () => {
      expect(getTierFromRating(0)).toBe('BRONZE')
      expect(getTierFromRating(100)).toBe('BRONZE')
      expect(getTierFromRating(199)).toBe('BRONZE')
      expect(getTierFromRating(200)).toBe('SILVER')
      expect(getTierFromRating(400)).toBe('GOLD')
      expect(getTierFromRating(600)).toBe('DIAMOND')
      expect(getTierFromRating(800)).toBe('MASTER')
      expect(getTierFromRating(1000)).toBe('GRANDMASTER')
    })

    it('최대 티어를 초과하는 레이팅도 GRANDMASTER를 반환한다', () => {
      expect(getTierFromRating(5000)).toBe('GRANDMASTER')
    })

    it('음수 레이팅은 BRONZE를 반환한다', () => {
      expect(getTierFromRating(-100)).toBe('BRONZE')
    })
  })

  describe('getWinDrawMultiplier', () => {
    it('티어별 배수를 올바르게 반환한다', () => {
      expect(getWinDrawMultiplier('BRONZE')).toBe(2.0)
      expect(getWinDrawMultiplier('SILVER')).toBe(1.5)
      expect(getWinDrawMultiplier('GOLD')).toBe(1.2)
      expect(getWinDrawMultiplier('DIAMOND')).toBe(1.0)
      expect(getWinDrawMultiplier('MASTER')).toBe(1.0)
      expect(getWinDrawMultiplier('GRANDMASTER')).toBe(1.0)
    })
  })

  describe('calculateRatingDelta', () => {
    it('승리 시 티어 배수가 적용된 레이팅 변화량을 반환한다', () => {
      expect(calculateRatingDelta('WIN', 'BRONZE')).toBe(30) // 15 * 2.0
      expect(calculateRatingDelta('WIN', 'SILVER')).toBe(23) // Math.round(15 * 1.5)
      expect(calculateRatingDelta('WIN', 'GOLD')).toBe(18) // Math.round(15 * 1.2)
      expect(calculateRatingDelta('WIN', 'DIAMOND')).toBe(15) // 15 * 1.0
    })

    it('무승부 시 티어 배수가 적용된 레이팅 변화량을 반환한다', () => {
      expect(calculateRatingDelta('DRAW', 'BRONZE')).toBe(10) // 5 * 2.0
      expect(calculateRatingDelta('DRAW', 'SILVER')).toBe(8) // Math.round(5 * 1.5)
      expect(calculateRatingDelta('DRAW', 'GOLD')).toBe(6) // Math.round(5 * 1.2)
    })

    it('패배 시 티어와 무관하게 고정 레이팅을 차감한다', () => {
      expect(calculateRatingDelta('LOSE', 'BRONZE')).toBe(-10)
      expect(calculateRatingDelta('LOSE', 'SILVER')).toBe(-10)
      expect(calculateRatingDelta('LOSE', 'GRANDMASTER')).toBe(-10)
    })
  })

  describe('getMvpBonus', () => {
    it('순위별 MVP 보너스를 반환한다', () => {
      expect(getMvpBonus(0)).toBe(10) // 1등
      expect(getMvpBonus(1)).toBe(5) // 2등
      expect(getMvpBonus(2)).toBe(3) // 3등
    })

    it('순위 범위 밖이면 0을 반환한다', () => {
      expect(getMvpBonus(3)).toBe(0)
      expect(getMvpBonus(100)).toBe(0)
    })
  })
})
