import { Injectable } from '@nestjs/common'
import { BattleResult } from '../../models/types/battleResult.types'
import { BattleTeam } from '../../models/types/battle.types'
import { BATTLE_TEAM } from '../../models/const/battles.const'

type TeamBattleResult = 'WIN' | 'LOSE' | 'DRAW'

@Injectable()
export class BattleResultService {
  // 승리 팀 계산
  determineWinningTeam(teamACount: number, teamBCount: number): 'A' | 'B' | 'DRAW' {
    return teamACount === teamBCount ? 'DRAW' : teamACount > teamBCount ? 'A' : 'B'
  }

  buildBattleResult(teamACount: number, teamBCount: number, totalParticipantsCount?: number | null, winningTeam?: string | null): BattleResult {
    const total = totalParticipantsCount ?? teamACount + teamBCount
    const neutral = Math.max(total - teamACount - teamBCount, 0)
    const percentage = (votes: number) => (total === 0 ? 0 : Math.round((votes / total) * 100))
    const winner = winningTeam ?? this.determineWinningTeam(teamACount, teamBCount)

    return {
      winner: winner as BattleResult['winner'],
      teamA: { votes: teamACount, percentage: percentage(teamACount) },
      teamB: { votes: teamBCount, percentage: percentage(teamBCount) },
      neutral: { votes: neutral, percentage: percentage(neutral) },
    }
  }

  // 배틀 팀별 결과 조회
  toBattleResultForTeam(team: BattleTeam, winningTeam: 'A' | 'B' | 'DRAW'): TeamBattleResult | null {
    if (team === BATTLE_TEAM.NONE) return null
    if (winningTeam === 'DRAW') return 'DRAW'
    if (team === BATTLE_TEAM.A) return winningTeam === 'A' ? 'WIN' : 'LOSE'
    if (team === BATTLE_TEAM.B) return winningTeam === 'B' ? 'WIN' : 'LOSE'
    return null
  }
}
