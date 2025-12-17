import { BattleResultMock } from '../mock/battleResults.mock'
import { BattleResult, Metrics, VoteTimeline, TimelineItem, Mvp } from '../types/battleResult.types'

export class BattleResultResponseDto {
  battleId: string
  title: string
  description: string
  status: 'CLOSED'
  language: string
  category: string
  playTime: number
  createdAt: string
  finishedAt: string

  codeA: string
  codeB: string

  result: BattleResult
  metrics: Metrics
  voteTimeline: VoteTimeline[]
  timeline: TimelineItem[]
  mvp: Mvp

  static fromEntity(battle: BattleResultMock, calculatedMvp: Mvp | null): BattleResultResponseDto {
    const dto = new BattleResultResponseDto()
    dto.battleId = battle.battleId
    dto.title = battle.title
    dto.description = battle.description
    dto.status = 'CLOSED'
    dto.language = battle.language
    dto.category = battle.category
    dto.playTime = battle.playTime
    dto.createdAt = battle.createdAt
    dto.finishedAt = battle.finishedAt
    dto.codeA = battle.codeA
    dto.codeB = battle.codeB
    dto.result = battle.result
    dto.metrics = battle.metrics
    dto.voteTimeline = battle.voteTimeline
    dto.timeline = battle.timeline
    dto.mvp = calculatedMvp || battle.mvp
    return dto
  }
}
