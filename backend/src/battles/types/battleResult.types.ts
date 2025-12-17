export interface VoteResult {
  votes: number
  percentage: number
}

export interface BattleResult {
  winner: 'A' | 'B' | 'DRAW'
  teamA: VoteResult
  teamB: VoteResult
  neutral: VoteResult
}

export interface Metrics {
  totalParticipants: number
  totalViews: number
  strategiesCount: number
}

export interface VoteTimeline {
  turn: number
  teamAVotes: number
  teamBVotes: number
  neutralVotes: number
  timestamp: string
}

export interface TimelineAuthor {
  id: string
  nickname: string
}

export interface TimelineItem {
  id: string
  type: 'ATTACK' | 'DEFENSE'
  author: TimelineAuthor
  team: 'A' | 'B'
  content: string
  turn: number
  upvotes: number
  createdAt: string
}

export interface Mvp {
  userId: string
  nickname: string
  team: 'A' | 'B'
  totalVotes: number
}
