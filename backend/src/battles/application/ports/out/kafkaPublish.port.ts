import { BattleTeam, BattleLanguage, BattleCategory, BattlePhaseName } from '../../../domains/models/types/battle.types'

//----채팅 이벤트---
export interface ChatMessageParam {
  battleId: string
  messageId: string
  team: BattleTeam
  sender: {
    userId: string
    nickname: string
    tier?: string
  }
  text: string
  createdAt: string
}

//---배틀 이벤트---
export interface BattleCreatedParam {
  type: 'battle.created'
  battleId: string
  title: string
  description: string
  codeA: string
  codeB: string
  language: BattleLanguage
  category: BattleCategory
  topics: string[]
}

export interface BattlePhaseChangedParam {
  type: 'battle.phase_changed'
  battleId: string
  currentPhase: BattlePhaseName
  currentRound: number
  phaseCount: number
  startedAt: number
  expiredAt: number
}

export interface BattleTerminatedParam {
  type: 'battle.finished'
  battleId: string
  participants: [string, BattleTeam][]
  winningTeam: 'A' | 'B' | 'DRAW'
  mvpIds: string[]
  finishedAt: string
}

export interface KafkaPubPort {
  publishChat(param: ChatMessageParam): Promise<void>
  publishBattleCreated(param: BattleCreatedParam): Promise<void>
  publishBattleTerminated(param: BattleTerminatedParam): Promise<void>
  publishBattlePhaseChanged(param: BattlePhaseChangedParam): Promise<void>
}
