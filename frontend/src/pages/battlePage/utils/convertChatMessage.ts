import type { BattleChat } from '@/commons/types/battle';
import type { BattleTeam } from '@cmc/types';

export interface Message {
  id: string;
  user: string;
  team: BattleTeam;
  content: string;
  timestamp: string;
  type?: 'chat' | 'attack' | 'defense';
  votes?: number;
}

export const convertBattleChatToMessage = (chat: BattleChat): Message => ({
  id: chat.messageId,
  user: chat.sender.nickname,
  team: chat.team,
  content: chat.text,
  timestamp: new Date(chat.createdAt).toISOString().replace('T', ' ').substring(0, 19),
  type: chat.type || 'chat',
  votes: chat.votes
});
