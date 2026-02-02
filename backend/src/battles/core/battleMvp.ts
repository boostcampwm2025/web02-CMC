import { Injectable } from '@nestjs/common'
import { Mvp, TimelineItem } from '../types/battleResult.types'
import { ActiveBattleState, BattleDiscussion } from '../types/battles.types'
import { MVP_DISPLAY_COUNT, BATTLE_TEAM } from '../const/battles.const'
import { calculateOpinionScore, compareMvpCandidates, createMvpCandidate, applyWinnerBonus } from '../service/utils/mvp.util'

@Injectable()
export class BattleMvpCalculator {
  calculate(state: ActiveBattleState, winner: 'A' | 'B' | 'DRAW'): Mvp[] {
    const allOpinions = state.opinionHistory
    if (allOpinions.length === 0) return []

    const candidateMap = this.buildCandidateMap(state, allOpinions)
    if (candidateMap.size === 0) return []

    this.setFinalTeams(state, candidateMap)
    this.applyWinnerBonuses(candidateMap, winner)

    return this.selectTopCandidates(candidateMap, winner)
  }

  // MVP 후보 데이터 집계
  private buildCandidateMap(state: ActiveBattleState, allOpinions: BattleDiscussion[]): Map<string, Mvp> {
    const candidateMap = new Map<string, Mvp>()

    allOpinions.forEach(opinion => {
      const { authorId, nickname } = opinion.author

      if (!authorId) return
      if (opinion.team === BATTLE_TEAM.NONE) return

      const voterCount = opinion.voterCountAtPhase ?? 0
      const opinionScore = calculateOpinionScore(opinion.upvotes, voterCount)

      const existing = candidateMap.get(authorId)
      if (existing) {
        existing.score += opinionScore
        existing.totalVotes += opinion.upvotes
        existing.opinionCount += 1
        if (opinion.status === 'SELECTED') {
          existing.selectedOpinionCount += 1
        }
      } else {
        const joinedAt = this.getParticipantJoinedAt(state, authorId)
        candidateMap.set(
          authorId,
          createMvpCandidate({
            userId: authorId,
            nickname,
            team: 'A',
            score: opinionScore,
            totalVotes: opinion.upvotes,
            opinionCount: 1,
            selectedOpinionCount: opinion.status === 'SELECTED' ? 1 : 0,
            joinedAt,
          }),
        )
      }
    })

    return candidateMap
  }

  // 최종 팀 기준으로 MVP 팀 설정 (팀 변경 반영)
  private setFinalTeams(state: ActiveBattleState, candidateMap: Map<string, Mvp>): void {
    candidateMap.forEach((candidate, userId) => {
      const finalTeam = state.participants.get(userId)
      candidate.team = finalTeam === BATTLE_TEAM.A ? 'A' : finalTeam === BATTLE_TEAM.B ? 'B' : 'NONE'
    })
  }

  // 승리 팀 보너스 적용 (1.5배)
  private applyWinnerBonuses(candidateMap: Map<string, Mvp>, winner: 'A' | 'B' | 'DRAW'): void {
    candidateMap.forEach(candidate => {
      candidate.score = applyWinnerBonus(candidate.score, candidate.team, winner)
    })
  }

  // 후보자 정렬 및 상위 3명 반환
  private selectTopCandidates(candidateMap: Map<string, Mvp>, winner: 'A' | 'B' | 'DRAW'): Mvp[] {
    const candidates = [...candidateMap.values()]
    candidates.sort((a, b) => compareMvpCandidates(a, b, winner))
    return candidates.slice(0, MVP_DISPLAY_COUNT)
  }

  buildLegacyMvpsFromNicknames(nicknames: string[], timeline: TimelineItem[]): Mvp[] {
    return nicknames.map((nickname, index) => {
      const fromTimeline = timeline.find(item => item.author.nickname === nickname)
      return {
        userId: fromTimeline?.author.id ?? `legacy-mvp-${index}`,
        nickname,
        team: fromTimeline?.team === 'B' ? 'B' : 'A',
        score: 0,
        totalVotes: 0,
        opinionCount: 0,
        selectedOpinionCount: 0,
        joinedAt: 0,
      }
    })
  }

  // participants Map의 삽입 순서를 기반으로 참가 순서 반환
  private getParticipantJoinedAt(state: ActiveBattleState, userId: string): number {
    const participantOrder = [...state.participants.keys()].indexOf(userId)
    return participantOrder >= 0 ? participantOrder : 0
  }
}
