import { BattleTeam } from '../../../domains/models/types/battle.types'

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
  publishBattleTerminated(param: BattleTerminatedParam): Promise<void>
}
