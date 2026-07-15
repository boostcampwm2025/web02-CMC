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

export interface KafkaPubPort {
  publishChat(param: ChatMessageParam): Promise<void>
}
