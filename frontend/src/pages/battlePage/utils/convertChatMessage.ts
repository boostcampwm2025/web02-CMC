import type { BattleChat, Team } from '@/commons/types/battle';

export interface Message {
  id: string;
  user: string;
  team: Team;
  content: string;
  timestamp: string;
  type?: 'chat' | 'attack' | 'defense';
  votes?: number;
}

export const convertBattleChatToMessage = (chat: BattleChat, userId: string): Message => ({
  id: chat.messageId,
  user: chat.sender.userId === userId ? 'You' : chat.sender.nickname,
  team: chat.team,
  content: chat.text,
  timestamp: new Date(chat.createdAt).toISOString().replace('T', ' ').substring(0, 19),
  type: chat.type || 'chat',
  votes: chat.votes
});
