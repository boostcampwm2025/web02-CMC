import type { BattleTeam, BattleLanguage, BattleCategory } from '@cmc/types'

export const BATTLE_EVENT_TYPE = {
  CREATED: 'battle.created',
  FINISHED: 'battle.finished',
} as const
export type BattleEventType = (typeof BATTLE_EVENT_TYPE)[keyof typeof BATTLE_EVENT_TYPE]

export interface BattleCreatedEvent {
  type: typeof BATTLE_EVENT_TYPE.CREATED
  battleId: string

  title: string
  description: string
  codeA: string
  codeB: string

  language: BattleLanguage
  category: BattleCategory
  topics: string[]
}

export interface BattleTerminatedEvent {
  type: typeof BATTLE_EVENT_TYPE.FINISHED
  battleId: string

  participants: [string, BattleTeam][]
  winningTeam: 'A' | 'B' | 'DRAW'

  mvpIds: string[]
  finishedAt: string
}

export type BattleEvent = BattleCreatedEvent | BattleTerminatedEvent
