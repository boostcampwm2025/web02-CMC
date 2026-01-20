import { BATTLE_PHASE, BATTLE_PLAYTIME } from '../const/battles.const'

import type {
  BattlePhaseName,
  BattleStatus,
  BattleLanguage,
  BattleType,
  BattleCategory,
  BattleChat,
  BattleDiscussion,
  BattleDefense,
  BattleResult,
  Metrics,
  VoteTimeline,
  TimelineItem,
  Mvp,
  BattleTeam,
} from '@cmc/types'

export type BattlePhase = (typeof BATTLE_PHASE)[keyof typeof BATTLE_PHASE]
export type BattlePlayTime = (typeof BATTLE_PLAYTIME)[keyof typeof BATTLE_PLAYTIME]

export interface Battle {
  id: string
  authorId: string
  title: string
  description: string
  aCode: string
  bCode: string

  language: BattleLanguage
  type: BattleType
  category: BattleCategory
  playTime: BattlePlayTime
  topics: string[]

  password?: string
  status: BattleStatus
  participantCount: number
  initialState: {
    round: number
    phase: BattlePhaseName
    phaseCount: number
    timeRemainingSeconds: number
  }

  createdAt: Date
  updatedAt: Date
}

export interface BattleTopOpinions {
  aTeam: BattleDiscussion | null
  bTeam: BattleDiscussion | null
}

export interface BattleData {
  roomId: string
  chats: BattleChat[]
  attacks: (BattleDiscussion | null)[]
  defenses: (BattleDefense | null)[]
}

export interface BattleTeamData extends BattleData {
  users: string[]
}

export interface ActiveBattleState {
  battleId: string

  all: BattleData
  teamA: BattleTeamData
  teamB: BattleTeamData

  participants: Map<string, BattleTeam>
  teamVotes: Map<string, BattleTeam>

  guestInfoMap: Map<string, string>

  round: number
  topics: string[]
  phase: BattlePhaseName
  phaseCount: number

  startedAt: number | null
  expiredAt: number | null
}

export interface FinishedBattleState {
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
}
