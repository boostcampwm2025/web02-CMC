import type { BattleTeam } from '@cmc/types'

export const CHAT_EVENT_TYPE = {
  RECEIVED: 'chat.received',
} as const
export type ChatEventType = (typeof CHAT_EVENT_TYPE)[keyof typeof CHAT_EVENT_TYPE]

export interface ChatReceivedEvent {
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

export type ChatEvent = ChatReceivedEvent
