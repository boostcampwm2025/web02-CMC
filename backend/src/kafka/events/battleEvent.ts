import type { BattleTeam, BattleLanguage, BattleCategory, BattlePhaseName } from '@cmc/types'

export const BATTLE_EVENT_TYPE = {
  CREATED: 'battle.created',
  PHASE_CHANGED: 'battle.phase_changed',
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

export interface BattlePhaseChangedEvent {
  type: typeof BATTLE_EVENT_TYPE.PHASE_CHANGED
  battleId: string

  currentPhase: BattlePhaseName
  currentRound: number
  phaseCount: number

  startedAt: number
  expiredAt: number
}

export interface BattleTerminatedEvent {
  type: typeof BATTLE_EVENT_TYPE.FINISHED
  battleId: string

  participants: [string, BattleTeam][]
  winningTeam: 'A' | 'B' | 'DRAW'

  mvpIds: string[]
  finishedAt: string
}

export type BattleEvent = BattleCreatedEvent | BattlePhaseChangedEvent | BattleTerminatedEvent
