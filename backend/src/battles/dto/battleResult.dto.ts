import { BattleResultMock } from '../../mock/battleResults.mock'

export class VoteResultDto {
  votes: number
  percentage: number
}

export class BattleResultDto {
  winner: 'A' | 'B' | 'DRAW'
  teamA: VoteResultDto
  teamB: VoteResultDto
  neutral: VoteResultDto
}

export class MetricsDto {
  totalParticipants: number
  totalViews: number
  strategiesCount: number
}

export class VoteTimelineDto {
  turn: number
  teamAVotes: number
  teamBVotes: number
  neutralVotes: number
  timestamp: string
}

export class TimelineAuthorDto {
  id: string
  nickname: string
}

export class TimelineItemDto {
  id: string
  type: 'ATTACK' | 'DEFENSE'
  author: TimelineAuthorDto
  team: 'A' | 'B'
  content: string
  turn: number
  upvotes: number
  createdAt: string
}

export class MvpDto {
  userId: string
  nickname: string
  team: 'A' | 'B'
  totalVotes: number
}

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

  result: BattleResultDto
  metrics: MetricsDto
  voteTimeline: VoteTimelineDto[]
  timeline: TimelineItemDto[]
  mvp: MvpDto

  static fromEntity(battle: BattleResultMock, calculatedMvp: MvpDto | null): BattleResultResponseDto {
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
