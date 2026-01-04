import type { BattleChat, Team } from '@/commons/types/battle';

export interface Message {
  id: string;
  user: string;
  team: Team;
  content: string;
  timestamp: string;
  type?: 'chat' | 'attack' | 'defense';
}

export const convertBattleChatToMessage = (chat: BattleChat, userId: string): Message => ({
  id: chat.messageId,
  user: chat.sender === userId ? 'You' : chat.sender,
  team: chat.team,
  content: chat.text,
  timestamp: new Date(chat.createdAt).toISOString().replace('T', ' ').substring(0, 19),
  type: chat.type || 'chat'
});
