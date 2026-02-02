import { Injectable } from '@nestjs/common'
import { BattleResult } from '../types/battleResult.types'
import { BattleTeam } from '../types/battles.types'
import { BATTLE_TEAM } from '../const/battles.const'

type TeamBattleResult = 'WIN' | 'LOSE' | 'DRAW'

@Injectable()
export class BattleResultBuilder {
  //승리 팀 계산
  calculateWinningTeam(teamACount: number, teamBCount: number): 'A' | 'B' | 'DRAW' {
    return teamACount === teamBCount ? 'DRAW' : teamACount > teamBCount ? 'A' : 'B'
  }

  //배틀 결과 생성
  build(teamACount: number, teamBCount: number, totalParticipantsCount?: number | null, winningTeam?: string | null): BattleResult {
    const total = totalParticipantsCount ?? teamACount + teamBCount
    const neutral = Math.max(total - teamACount - teamBCount, 0)
    const percentage = (votes: number) => (total === 0 ? 0 : Math.round((votes / total) * 100))
    const winner = winningTeam ?? this.calculateWinningTeam(teamACount, teamBCount)

    return {
      winner: winner as BattleResult['winner'],
      teamA: { votes: teamACount, percentage: percentage(teamACount) },
      teamB: { votes: teamBCount, percentage: percentage(teamBCount) },
      neutral: { votes: neutral, percentage: percentage(neutral) },
    }
  }

  //배틀 결과 조회회
  getBattleResultForTeam(team: BattleTeam, winningTeam: 'A' | 'B' | 'DRAW'): TeamBattleResult | null {
    if (team === BATTLE_TEAM.NONE) return null
    if (winningTeam === 'DRAW') return 'DRAW'
    if (team === BATTLE_TEAM.A) return winningTeam === 'A' ? 'WIN' : 'LOSE'
    if (team === BATTLE_TEAM.B) return winningTeam === 'B' ? 'WIN' : 'LOSE'
    return null
  }
}
