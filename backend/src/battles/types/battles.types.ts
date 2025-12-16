import { BATTLE_LANGUAGE, BATTLE_TYPE, BATTLE_CATEGORY, BATTLE_PLAYTIME } from '../const/battles.const'

export type BattleStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED'

export type BattlePhase = 'WAITING_FOR_START' | 'OPINION_SHARE' | 'TEAM_A_ATTACK' | 'TEAM_B_ATTACK' | 'TEAM_SWITCH'

export interface Battle {
  id: string
  authorId: string
  title: string
  description: string
  aCode: string
  bCode: string
  language: string
  type: 'PUBLIC' | 'PRIVATE'
  category: string
  playTime: number
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
