export const TIER_STEP = 200

export const TIER_NAMES = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER'] as const

export type TierName = (typeof TIER_NAMES)[number]

export const WIN_DRAW_MULTIPLIER_BY_TIER: Record<TierName, number> = {
  BRONZE: 2.0,
  SILVER: 1.5,
  GOLD: 1.2,
  PLATINUM: 1.0,
  DIAMOND: 1.0,
  MASTER: 1.0,
  GRANDMASTER: 1.0,
}

export const MVP_BONUS_BY_RANK = [10, 5, 3] as const

export const BASE_DELTA = {
  WIN: 15,
  DRAW: 5,
  LOSE: -10,
} as const
