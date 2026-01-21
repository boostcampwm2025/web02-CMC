import type { BattleLeaveResponse, TeamCounts } from '@cmc/types'
import { ActiveBattleState } from '../types/battles.types'

export class BattleLeaveResponseDto implements BattleLeaveResponse {
  battleId: string
  counts: TeamCounts

  static fromEntity(payload: ActiveBattleState): BattleLeaveResponseDto {
    const res = new BattleLeaveResponseDto()
    const { teamA, teamB, participants } = payload

    res.battleId = payload.battleId
    res.counts = {
      teamA: teamA.users.length,
      teamB: teamB.users.length,
      teamNone: participants.size - (teamA.users.length + teamB.users.length),
    }
    return res
  }

  static of(payload: ActiveBattleState): BattleLeaveResponseDto {
    return BattleLeaveResponseDto.fromEntity(payload)
  }
}
