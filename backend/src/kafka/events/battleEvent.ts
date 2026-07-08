import type { BattleCategory, BattleLanguage } from '@cmc/types'

export const BATTLE_EVENT_TYPE = {
  CREATED: 'battle.created',
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

export type BattleEvent = BattleCreatedEvent
