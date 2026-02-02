import { Injectable } from '@nestjs/common'
import { BattleTeam } from '../types/battles.types'
import { BATTLE_TEAM } from '../const/battles.const'
import { calculateRatingDelta, coerceTierName, getMvpBonus, getTierFromRating } from '../service/utils/rating.util'
import type { Mvp } from '../types/battleResult.types'

type BattleResult = 'WIN' | 'LOSE' | 'DRAW'

export interface UserRatingUpdate {
  userId: string
  currentRating: number
  currentTier: string | null
  nextRating: number
  nextTier: string
  delta: number
  mvpBonus: number
}

@Injectable()
export class BattleTierCalculator {
  getBattleResultForTeam(team: BattleTeam, winningTeam: 'A' | 'B' | 'DRAW'): BattleResult | null {
    if (team === BATTLE_TEAM.NONE) return null
    if (winningTeam === 'DRAW') return 'DRAW'
    if (team === BATTLE_TEAM.A) return winningTeam === 'A' ? 'WIN' : 'LOSE'
    if (team === BATTLE_TEAM.B) return winningTeam === 'B' ? 'WIN' : 'LOSE'
    return null
  }

  calculateRatingUpdates(
    participants: Map<string, BattleTeam>,
    users: Array<{ id: string; rating: number | null; tier: string | null }>,
    winningTeam: 'A' | 'B' | 'DRAW',
    mvps: Mvp[],
  ): UserRatingUpdate[] {
    const topMvps = mvps.slice(0, 3)
    const mvpBonusByUserId = new Map<string, number>()
    topMvps.forEach((mvp, index) => {
      const bonus = getMvpBonus(index)
      if (bonus > 0) mvpBonusByUserId.set(mvp.userId, bonus)
    })

    const updates: UserRatingUpdate[] = []

    users.forEach(user => {
      const team = participants.get(user.id)
      if (!team) return

      const result = this.getBattleResultForTeam(team, winningTeam)
      if (!result) return

      const currentRating = user.rating ?? 0
      const currentTier = coerceTierName(user.tier)
      const delta = calculateRatingDelta(result, currentTier)
      const mvpBonus = mvpBonusByUserId.get(user.id) ?? 0
      const nextRating = Math.max(0, currentRating + delta + mvpBonus)
      const nextTier = getTierFromRating(nextRating)

      if (nextRating === currentRating && nextTier === currentTier) return

      updates.push({
        userId: user.id,
        currentRating,
        currentTier: user.tier,
        nextRating,
        nextTier,
        delta,
        mvpBonus,
      })
    })

    return updates
  }

  getMvpBonusByRank(rank: number): number {
    return getMvpBonus(rank)
  }
}
