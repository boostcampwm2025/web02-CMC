import type { BattlePhaseName, BattleTeam, BattleDiscussionStatus } from '@cmc/types';

export interface RedisCore {
  battleId: string
  status?: string
  round: number
  topics: string[]
  totalRounds: number
  phase: BattlePhaseName
  phaseCount: number
  startedAt: number | null
  expiredAt: number | null
  skipState: string[]
  participants: [string, BattleTeam][]
  teamVotes: [string, BattleTeam][]
  userInfoMap: [string, string][]
  teamAUsers: string[]
  teamBUsers: string[]
  allRoomId: string
  teamARoomId: string
  teamBRoomId: string
}

export interface BattleDiscussion {
  discussionId: string
  author: { authorId: string; nickname: string }
  type: 'ATTACK' | 'DEFENSE'
  content: string
  upvotes: number
  votes: string[]
  status: BattleDiscussionStatus
  selectedAt?: number
  team: BattleTeam
}

export interface BattleChat {
  messageId: string
  team: BattleTeam
  sender: { userId: string; nickname: string; tier?: string }
  text: string
  createdAt: string
}

export interface DbBattle {
  id: string
  title: string
  status: string
  current_phase: string | null
  current_round: number | null
  phase_count: number | null
  started_at: Date | null
  expired_at: Date | null
  play_time: string
  topics: string[]
  is_private: boolean
  participants_state: unknown
  team_votes_state: unknown
  user_info_state: unknown
}
