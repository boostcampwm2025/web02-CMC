import { useEffect, useCallback, useMemo } from 'react';
import type { BattleChat } from '@/commons/types/battle';
import {
  useBattleStore,
  selectSocket,
  selectUserId,
  selectBattleId,
  selectSelectedTeam,
  selectTeamChats,
  selectAllChats
} from '../stores/battleStore';
import { convertBattleChatToMessage } from '../utils/convertChatMessage';

export function useBattleChat() {
  const socket = useBattleStore(selectSocket);
  const userId = useBattleStore(selectUserId);
  const battleId = useBattleStore(selectBattleId);
  const team = useBattleStore(selectSelectedTeam);
  const teamChats = useBattleStore(selectTeamChats);
  const allChats = useBattleStore(selectAllChats);
  const addChat = useBattleStore((state) => state.addChat);

  // 팀 채팅: 같은 팀인 것만
  const teamMessages = useMemo(
    () => teamChats.filter((chat) => chat.team === team).map((chat) => convertBattleChatToMessage(chat, userId)),
    [teamChats, team, userId]
  );

  // 전체 채팅: 그대로
  const allMessages = useMemo(
    () => allChats.map((chat) => convertBattleChatToMessage(chat, userId)),
    [allChats, userId]
  );

  // 실시간 채팅 업데이트 이벤트 구독
  useEffect(() => {
    if (!socket) return;

    const handleChatUpdate = (message: BattleChat) => {
      addChat(message);
    };

    socket.on('battle:chatUpdate', handleChatUpdate);

    return () => {
      socket.off('battle:chatUpdate', handleChatUpdate);
    };
  }, [socket, addChat]);

  // 메시지 전송
  const sendMessage = useCallback(
    (content: string, scope: 'TEAM' | 'ALL') => {
      if (!socket) return;

      const chatMessage = {
        battleId,
        scope,
        team,
        text: content.trim()
      };

      // Optimistic update: 즉시 로컬 state에 추가
      const optimisticMessage: BattleChat = {
        messageId: `temp-${Date.now()}`,
        battleId,
        sender: userId,
        team,
        scope,
        text: content.trim(),
        createdAt: new Date().toISOString() as any
      };
      addChat(optimisticMessage);

      socket.emit('battle:chat', chatMessage);
    },
    [socket, battleId, team, userId, addChat]
  );

  return {
    teamMessages,
    allMessages,
    sendMessage
  };
}
