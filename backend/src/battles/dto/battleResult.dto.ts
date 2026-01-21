import { FinishedBattleState } from '../types/battles.types'
import type { BattleResult, Metrics, VoteTimeline, TimelineItem, Mvp, BattleResultResponse } from '@cmc/types'

export class BattleResultResponseDto implements BattleResultResponse {
  battleId: string
  authorId: string
  title: string
  description: string
  status: 'CLOSED'
  language: string
  category: string
  playTime: number
  topics: string[]
  createdAt: string
  finishedAt: string

  codeA: string
  codeB: string

  result: BattleResult
  metrics: Metrics
  voteTimeline: VoteTimeline[]
  timeline: TimelineItem[]
  mvp: Mvp

  static fromEntity(battle: FinishedBattleState, calculatedMvp: Mvp | null): BattleResultResponseDto {
    const dto = new BattleResultResponseDto()
    dto.battleId = battle.battleId
    dto.authorId = battle.authorId
    dto.title = battle.title
    dto.description = battle.description
    dto.status = 'CLOSED'
    dto.language = battle.language
    dto.category = battle.category
    dto.playTime = battle.playTime
    dto.topics = battle.topics
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
