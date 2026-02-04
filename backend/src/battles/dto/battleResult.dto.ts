import { type Battle as PrismaBattle } from 'generated/prisma/client'
import { FinishedBattleState } from '../domains/models/types/battle.types'
import { BattleResult, Metrics, VoteTimeline, TimelineItem, Mvp } from '../domains/models/types/battleResult.types'
import { BATTLE_PLAYTIME } from '../domains/models/const/battles.const'

export class BattleResultResponseDto {
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
  mvps: Mvp[]

  static fromEntity(battle: FinishedBattleState): BattleResultResponseDto {
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
    dto.result = battle.result as BattleResult
    dto.metrics = battle.metrics as Metrics
    dto.voteTimeline = battle.voteTimeline as VoteTimeline[]
    dto.timeline = battle.timeline as TimelineItem[]
    dto.mvps = battle.mvps as Mvp[]
    return dto
  }

  /**
   * PrismaBattle에서 BattleResultResponseDto 생성 (기존 getBattleResult 로직)
   */
  static fromPrismaBattle(battle: PrismaBattle, result: BattleResult, timeline: TimelineItem[], mvps: Mvp[]): BattleResultResponseDto {
    const teamACount = battle.teamACount ?? 0
    const teamBCount = battle.teamBCount ?? 0
    const totalParticipants = battle.totalParticipantsCount ?? teamACount + teamBCount
    const finishedAt = battle.finishedAt ? battle.finishedAt.toISOString() : (battle.updatedAt?.toISOString() ?? battle.createdAt.toISOString())
    const playTimeKey = battle.playTime as keyof typeof BATTLE_PLAYTIME

    const dto = new BattleResultResponseDto()
    dto.battleId = battle.id
    dto.authorId = battle.userId
    dto.title = battle.title
    dto.description = battle.description
    dto.status = 'CLOSED'
    dto.language = battle.language
    dto.category = battle.category
    dto.playTime = BATTLE_PLAYTIME[playTimeKey]?.time ?? 0
    dto.topics = battle.topics
    dto.createdAt = battle.createdAt.toISOString()
    dto.finishedAt = finishedAt
    dto.codeA = battle.codeA
    dto.codeB = battle.codeB
    dto.result = result
    dto.metrics = {
      totalParticipants,
      totalViews: totalParticipants,
      strategiesCount: timeline.length,
      totalChats: 0,
    }
    dto.voteTimeline = [
      {
        turn: 1,
        teamAVotes: teamACount,
        teamBVotes: teamBCount,
        neutralVotes: Math.max(totalParticipants - teamACount - teamBCount, 0),
        timestamp: finishedAt,
      },
    ]
    dto.timeline = timeline
    dto.mvps = mvps

    return dto
  }
}
