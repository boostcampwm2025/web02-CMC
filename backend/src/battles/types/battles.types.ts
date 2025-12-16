import { BattleType, BattleCategory, BattlePlayTime } from '../const/battles.const'

export type BattleViewStatus = 'OPEN' | 'CLOSED'
export type BattleStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED'
export type BattlePhase = 'WAITING_FOR_START' | 'OPINION_SHARE' | 'TEAM_A_ATTACK' | 'TEAM_B_ATTACK' | 'TEAM_SWITCH'
export type BattleLanguage = 'TS' | 'JS' | 'PYTHON'
export type Team = 'A' | 'B' | 'NONE'

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

  password?: string
  status: BattleStatus
  createdAt: Date
  updatedAt: Date
  participantCount: number
  initialState: {
    round: number
    phase: BattlePhase
    timeRemainingSeconds: number
  }
}
