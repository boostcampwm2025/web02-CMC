import { BATTLE_TEAM } from '../const/battles.const'
import type { BattleTeam } from '../types/battles.types'

export interface TeamCounts {
  teamA: number
  teamB: number
  teamNone: number
}

export interface TeamChange {
  userId: string
  from: BattleTeam
  to: BattleTeam
}

export class BattleTeamUpdateAllResponseDto {
  battleId: string
  round: number

  // 변경 전 인원 수
  before: TeamCounts

  // 변경 후 인원 수
  after: TeamCounts

  // 각 클라이언트의 팀 변경 정보 (소켓 룸 이동용)
  changes: TeamChange[]

  // 변화량 (after - before)
  difference: {
    teamA: number
    teamB: number
    teamNone: number
  }

  // 우세한 팀
  dominantTeam: BattleTeam | null

  static of(battleId: string, round: number, before: TeamCounts, after: TeamCounts, changes: TeamChange[]): BattleTeamUpdateAllResponseDto {
    const res = new BattleTeamUpdateAllResponseDto()
    res.battleId = battleId
    res.round = round
    res.before = before
    res.after = after
    res.changes = changes

    // 변화량 계산
    res.difference = {
      teamA: after.teamA - before.teamA,
      teamB: after.teamB - before.teamB,
      teamNone: after.teamNone - before.teamNone,
    }

    // 우세한 팀 판단
    if (after.teamA > after.teamB) {
      res.dominantTeam = BATTLE_TEAM.A
    } else if (after.teamB > after.teamA) {
      res.dominantTeam = BATTLE_TEAM.B
    } else {
      res.dominantTeam = null //동점
    }

    return res
  }
}
