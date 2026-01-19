import {
  BATTLE_CATEGORY,
  BATTLE_LANGUAGE,
  BATTLE_PHASE,
  BATTLE_PLAYTIME,
  BATTLE_TYPE,
  BATTLE_STATUS,
  BATTLE_TEAM,
  BATTLE_DISCUSSION_TYPE,
} from '../const/battles.const'

import { BattleResult, Metrics, VoteTimeline, TimelineItem, Mvp } from '../types/battleResult.types'
export type BattlePhaseName = (typeof BATTLE_PHASE)[keyof typeof BATTLE_PHASE]['name']
export type BattlePhase = (typeof BATTLE_PHASE)[keyof typeof BATTLE_PHASE]
export type BattleLanguage = (typeof BATTLE_LANGUAGE)[keyof typeof BATTLE_LANGUAGE]
export type BattleStatus = (typeof BATTLE_STATUS)[keyof typeof BATTLE_STATUS]
export type BattleType = (typeof BATTLE_TYPE)[keyof typeof BATTLE_TYPE]
export type BattleDiscussionType = (typeof BATTLE_DISCUSSION_TYPE)[keyof typeof BATTLE_DISCUSSION_TYPE]
export type BattleCategory = (typeof BATTLE_CATEGORY)[keyof typeof BATTLE_CATEGORY]
export type BattlePlayTimeName = (typeof BATTLE_PLAYTIME)[keyof typeof BATTLE_PLAYTIME]['name']
export type BattlePlayTime = (typeof BATTLE_PLAYTIME)[keyof typeof BATTLE_PLAYTIME]
export type BattleTeam = (typeof BATTLE_TEAM)[keyof typeof BATTLE_TEAM]
export type BattleDiscussionStatus = 'PENDING' | 'SELECTED' | 'REJECTED'

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
export interface BattleChat {
  messageId: string
  team: BattleTeam
  sender: {
    userId: string
    nickname: string
  }
  text: string
  createdAt: Date
}

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
