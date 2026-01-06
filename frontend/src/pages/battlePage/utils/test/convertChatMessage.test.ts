import { describe, it, expect } from 'vitest';
import { convertBattleChatToMessage } from '../convertChatMessage';
import type { BattleChat } from '@/commons/types/battle';

describe('메시지 변환', () => {
  const mockChat: BattleChat = {
    messageId: 'msg-123',
    battleId: 'battle-1',
    sender: 'user-abc',
    team: 'A',
    scope: 'ALL',
    text: 'Hello World',
    createdAt: new Date('2026-01-04T10:30:00Z')
  };

  it('자신의 메시지는 "You"로 표시', () => {
    const result = convertBattleChatToMessage(mockChat, 'user-abc');
    expect(result.user).toBe('You');
  });

  it('다른 사용자 메시지는 ID 그대로 표시', () => {
    const result = convertBattleChatToMessage(mockChat, 'different-user');
    expect(result.user).toBe('user-abc');
  });
});
