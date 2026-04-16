import { describe, it, expect } from 'vitest';
import { convertBattleChatToMessage } from '@/features/battle/utils/convertChatMessage';
import type { BattleChat } from '@/commons/types/battle';

describe('메시지 변환', () => {
  const mockChat: BattleChat = {
    messageId: 'msg-123',
    battleId: 'battle-1',
    sender: { userId: 'user-abc', nickname: 'testNick' },
    team: 'A',
    scope: 'ALL',
    text: 'Hello World',
    createdAt: new Date('2026-01-04T10:30:00Z')
  };

  it('BattleChat을 Message로 변환이 잘되는지', () => {
    const result = convertBattleChatToMessage(mockChat);
    expect(result.id).toBe('msg-123');
    expect(result.user).toBe('testNick');
    expect(result.team).toBe('A');
    expect(result.content).toBe('Hello World');
    expect(result.type).toBe('chat');
  });
});
