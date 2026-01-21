import type { TeamCounts, BattleUserUpdateResponse } from '@cmc/types'

export class BattleUserUpdateResponseDto implements BattleUserUpdateResponse {
  battleId: string

  totalCount: number
  counts: TeamCounts

  static of(battleId: string, counts: TeamCounts) {
    const res = new BattleUserUpdateResponseDto()
    res.battleId = battleId
    res.counts = counts
    res.totalCount = counts.teamA + counts.teamB + counts.teamNone
    return res
  }
}
