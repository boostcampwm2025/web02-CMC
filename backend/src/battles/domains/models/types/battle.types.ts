import { BATTLE_PHASE, BATTLE_PLAYTIME, BATTLE_DISCUSSION_TYPE } from '../const/battles.const'
import type { BattlePhaseName, BattleTeam, BattleStatus, BattleLanguage, BattleCategory, BattleType, BattleDiscussionStatus } from '@cmc/types'

import { BattleResult, Metrics, VoteTimeline, TimelineItem, Mvp } from './battleResult.types'
import type { BattleReferenceData } from './ai.types'

export type { BattlePhaseName, BattleTeam, BattleStatus, BattleLanguage, BattleCategory, BattleType, BattleDiscussionStatus }
export type BattlePhase = (typeof BATTLE_PHASE)[keyof typeof BATTLE_PHASE]
export type BattleDiscussionType = (typeof BATTLE_DISCUSSION_TYPE)[keyof typeof BATTLE_DISCUSSION_TYPE]
export type BattlePlayTimeName = (typeof BATTLE_PLAYTIME)[keyof typeof BATTLE_PLAYTIME]['name']
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

  inviteCode?: string
  status: BattleStatus
  participantCount: number
  initialState: {
    round: number
    phase: BattlePhaseName
    phaseCount: number
    timeRemainingSeconds: number
  }

  referenceData?: BattleReferenceData | null

  createdAt: Date
  updatedAt: Date
}
export interface BattleChat {
  messageId: string
  team: BattleTeam
  sender: {
    userId: string
    nickname: string
    tier?: string
  }
  text: string
  createdAt: Date
}

export type ParticipantEntry = { userId: string; team: BattleTeam }
export type TeamVoteEntry = { userId: string; team: BattleTeam }
export type UserInfoEntry = { userId: string; nickname: string }
export type BattleUserInfo = string | { nickname: string; tier?: string | null }
export type BattleChatSnapshot = Omit<BattleChat, 'createdAt'> & { createdAt: string }

export interface BattleDiscussion {
  discussionId: string
  author: {
    authorId: string
    nickname: string
  }
  type: BattleDiscussionType
  content: string
  upvotes: number
  votes: string[]
  status: BattleDiscussionStatus
  selectedAt?: number // SELECTED로 변경된 시간 (timestamp)
  team: BattleTeam // 어느 팀의 토론인지
  voterCountAtPhase?: number // 해당 페이즈 종료 시 팀 투표 참가자 수
}

export interface BattleTopOpinions {
  aTeam: BattleDiscussion | null
  bTeam: BattleDiscussion | null
}

export type BattleDefense = BattleDiscussion

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

  status: string

  all: BattleData
  teamA: BattleTeamData
  teamB: BattleTeamData

  participants: Map<string, BattleTeam>
  teamVotes: Map<string, BattleTeam>

  userInfoMap: Map<string, BattleUserInfo>

  opinionHistory: BattleDiscussion[]
  skipState: Set<string>

  round: number
  topics: string[]
  totalRounds: number
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
  mvps: Mvp[]
}
