import { BASE_DELTA, MVP_BONUS_BY_RANK, TIER_NAMES, TIER_STEP, WIN_DRAW_MULTIPLIER_BY_TIER, type TierName } from '../../const/rating.const'

type BattleResult = 'WIN' | 'DRAW' | 'LOSE'

export const coerceTierName = (tier: string | null | undefined): TierName => {
  return (TIER_NAMES as readonly string[]).includes(tier ?? '') ? (tier as TierName) : 'BRONZE'
}

export const getTierFromRating = (rating: number): TierName => {
  const index = Math.max(0, Math.floor(rating / TIER_STEP))
  return TIER_NAMES[Math.min(index, TIER_NAMES.length - 1)]
}

export const getWinDrawMultiplier = (tier: TierName): number => {
  return WIN_DRAW_MULTIPLIER_BY_TIER[tier] ?? 1.0
}

export const calculateRatingDelta = (result: BattleResult, tier: TierName): number => {
  const base = BASE_DELTA[result]
  if (result === 'LOSE') return base
  return Math.round(base * getWinDrawMultiplier(tier))
}

export const getMvpBonus = (rank: number): number => {
  return MVP_BONUS_BY_RANK[rank] ?? 0
}
