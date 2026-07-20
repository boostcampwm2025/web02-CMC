import type { BattleTeam } from '@cmc/types'

export const BATTLE_EVENT_TYPE = {
  FINISHED: 'battle.finished',
} as const
export type BattleEventType = (typeof BATTLE_EVENT_TYPE)[keyof typeof BATTLE_EVENT_TYPE]

export interface BattleTerminatedEvent {
  type: typeof BATTLE_EVENT_TYPE.FINISHED
  battleId: string

  participants: [string, BattleTeam][]
  winningTeam: 'A' | 'B' | 'DRAW'

  mvpIds: string[]
  finishedAt: string
}

export type BattleEvent = BattleTerminatedEvent
