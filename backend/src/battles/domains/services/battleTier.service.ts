import { Injectable } from '@nestjs/common'
import { BattleTeam } from '../models/types/battle.types'
import { calculateRatingDelta, coerceTierName, getMvpBonus, getTierFromRating } from './utils/rating.util'
import type { Mvp } from '../models/types/battleResult.types'

type TeamBattleResult = 'WIN' | 'LOSE' | 'DRAW'

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
export class BattleTierService {
  // 티어 업데이트 계산
  buildRatingUpdates(
    participants: Map<string, BattleTeam>,
    users: Array<{ id: string; rating: number | null; tier: string | null }>,
    winningTeam: 'A' | 'B' | 'DRAW',
    mvps: Mvp[],
    getBattleResultForTeam: (team: BattleTeam, winningTeam: 'A' | 'B' | 'DRAW') => TeamBattleResult | null,
  ): UserRatingUpdate[] {
    const mvpBonusByUserId = this.buildMvpBonusMap(mvps)
    return this.buildUserUpdates(participants, users, winningTeam, mvpBonusByUserId, getBattleResultForTeam)
  }

  private buildMvpBonusMap(mvps: Mvp[]): Map<string, number> {
    const topMvps = mvps.slice(0, 3)
    const mvpBonusByUserId = new Map<string, number>()
    topMvps.forEach((mvp, index) => {
      const bonus = getMvpBonus(index)
      if (bonus > 0) mvpBonusByUserId.set(mvp.userId, bonus)
    })
    return mvpBonusByUserId
  }

  private buildUserUpdates(
    participants: Map<string, BattleTeam>,
    users: Array<{ id: string; rating: number | null; tier: string | null }>,
    winningTeam: 'A' | 'B' | 'DRAW',
    mvpBonusByUserId: Map<string, number>,
    getBattleResultForTeam: (team: BattleTeam, winningTeam: 'A' | 'B' | 'DRAW') => TeamBattleResult | null,
  ): UserRatingUpdate[] {
    const updates: UserRatingUpdate[] = []

    users.forEach(user => {
      const update = this.buildUserUpdate(participants, user, winningTeam, mvpBonusByUserId, getBattleResultForTeam)
      if (update) {
        updates.push(update)
      }
    })

    return updates
  }

  private buildUserUpdate(
    participants: Map<string, BattleTeam>,
    user: { id: string; rating: number | null; tier: string | null },
    winningTeam: 'A' | 'B' | 'DRAW',
    mvpBonusByUserId: Map<string, number>,
    getBattleResultForTeam: (team: BattleTeam, winningTeam: 'A' | 'B' | 'DRAW') => TeamBattleResult | null,
  ): UserRatingUpdate | null {
    const team = participants.get(user.id)
    if (!team) return null

    const result = getBattleResultForTeam(team, winningTeam)
    if (!result) return null

    const currentRating = user.rating ?? 0
    const currentTier = coerceTierName(user.tier)
    const delta = calculateRatingDelta(result, currentTier)
    const mvpBonus = mvpBonusByUserId.get(user.id) ?? 0
    const nextRating = Math.max(0, currentRating + delta + mvpBonus)
    const nextTier = getTierFromRating(nextRating)

    if (nextRating === currentRating && nextTier === currentTier) return null

    return {
      userId: user.id,
      currentRating,
      currentTier: user.tier,
      nextRating,
      nextTier,
      delta,
      mvpBonus,
    }
  }
}
