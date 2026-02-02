import { Injectable } from '@nestjs/common'
import { Mvp } from '../types/battleResult.types'
import { ActiveBattleState, BattleDiscussion } from '../types/battles.types'
import { MVP_DISPLAY_COUNT, BATTLE_TEAM } from '../const/battles.const'
import { calculateOpinionScore, compareMvpCandidates, createMvpCandidate, applyWinnerBonus } from '../service/utils/mvp.util'

@Injectable()
export class BattleMvpCalculator {
  calculate(state: ActiveBattleState, winner: 'A' | 'B' | 'DRAW'): Mvp[] {
    // 모든 의견 수집 (opinionHistory에 저장된 전체 의견)
    // teamA/teamB는 resetDiscussions에서 초기화되므로 opinionHistory 사용
    const allOpinions: BattleDiscussion[] = state.opinionHistory

    if (allOpinions.length === 0) return []

    // 사용자별 MVP 후보 데이터 집계
    const candidateMap = new Map<string, Mvp>()

    allOpinions.forEach(opinion => {
      const { authorId, nickname } = opinion.author

      // 빈 userId(placeholder) 제외
      if (!authorId) return

      // 의견 제출 시점에 중립 팀이면 점수 집계 제외 (중립은 의견 제출 불가)
      if (opinion.team === BATTLE_TEAM.NONE) return

      // 페이즈별로 기록된 투표 참가자 수 사용 (없으면 0으로 처리)
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

    // 최종 팀 기준으로 MVP 팀 설정 (팀 변경 반영)
    candidateMap.forEach((candidate, userId) => {
      const finalTeam = state.participants.get(userId)
      candidate.team = finalTeam === BATTLE_TEAM.A ? 'A' : finalTeam === BATTLE_TEAM.B ? 'B' : 'NONE'
    })

    if (candidateMap.size === 0) return []

    // 승리 팀 보너스 적용 (1.5배)
    candidateMap.forEach(candidate => {
      candidate.score = applyWinnerBonus(candidate.score, candidate.team, winner)
    })

    // 후보자 정렬 및 상위 MVP_DISPLAY_COUNT명 반환
    const candidates = [...candidateMap.values()]
    candidates.sort((a, b) => compareMvpCandidates(a, b, winner))

    return candidates.slice(0, MVP_DISPLAY_COUNT)
  }

  private getParticipantJoinedAt(state: ActiveBattleState, userId: string): number {
    // participants Map의 삽입 순서를 기반으로 참가 순서 반환
    const participantOrder = [...state.participants.keys()].indexOf(userId)
    return participantOrder >= 0 ? participantOrder : 0
  }
}
