import { Injectable } from '@nestjs/common'
import { BattleResult } from '../types/battleResult.types'

@Injectable()
export class BattleResultBuilder {
  build(teamACount: number, teamBCount: number, totalParticipantsCount?: number | null, winningTeam?: string | null): BattleResult {
    const total = totalParticipantsCount ?? teamACount + teamBCount
    const neutral = Math.max(total - teamACount - teamBCount, 0)
    const percentage = (votes: number) => (total === 0 ? 0 : Math.round((votes / total) * 100))
    const winner = winningTeam ?? (teamACount === teamBCount ? 'DRAW' : teamACount > teamBCount ? 'A' : 'B')

    return {
      winner: winner as BattleResult['winner'],
      teamA: { votes: teamACount, percentage: percentage(teamACount) },
      teamB: { votes: teamBCount, percentage: percentage(teamBCount) },
      neutral: { votes: neutral, percentage: percentage(neutral) },
    }
  }
}
