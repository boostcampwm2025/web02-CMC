import { ActiveBattleState } from '../domains/models/types/battle.types'

export class BattleLeaveResponseDto {
  battleId: string
  counts: {
    teamA: number
    teamB: number
    teamNone: number
  }
  totalSkips: number

  static fromEntity(payload: ActiveBattleState): BattleLeaveResponseDto {
    const res = new BattleLeaveResponseDto()
    const { teamA, teamB, participants, skipState } = payload

    res.battleId = payload.battleId
    res.counts = {
      teamA: teamA.users.length,
      teamB: teamB.users.length,
      teamNone: participants.size - (teamA.users.length + teamB.users.length),
    }
    res.totalSkips = skipState.size
    return res
  }

  static of(payload: ActiveBattleState): BattleLeaveResponseDto {
    return BattleLeaveResponseDto.fromEntity(payload)
  }
}
