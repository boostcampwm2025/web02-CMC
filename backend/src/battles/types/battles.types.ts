import { BATTLE_CATEGORY, BATTLE_LANGUAGE, BATTLE_PHASE, BATTLE_PLAYTIME, BATTLE_TYPE, BATTLE_STATUS, BATTLE_TEAM } from '../const/battles.const'

export type BattlePhase = (typeof BATTLE_PHASE)[keyof typeof BATTLE_PHASE]
export type BattleLanguage = (typeof BATTLE_LANGUAGE)[keyof typeof BATTLE_LANGUAGE]
export type BattleStatus = (typeof BATTLE_STATUS)[keyof typeof BATTLE_STATUS]
export type BattleType = (typeof BATTLE_TYPE)[keyof typeof BATTLE_TYPE]
export type BattleCategory = (typeof BATTLE_CATEGORY)[keyof typeof BATTLE_CATEGORY]
export type BattlePlayTime = (typeof BATTLE_PLAYTIME)[keyof typeof BATTLE_PLAYTIME]
export type BattleTeam = (typeof BATTLE_TEAM)[keyof typeof BATTLE_TEAM]

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
  participantCount: number
  initialState: {
    round: number
    phase: BattlePhase
    timeRemainingSeconds: number
  }

  createdAt: Date
  updatedAt: Date
}
