import { useEffect, useCallback, useMemo } from 'react';
import type { BattleChat } from '@/commons/types/battle';
import {
  useBattleStore,
  selectSocket,
  selectUserId,
  selectBattleId,
  selectSelectedTeam,
  selectChats
} from '../stores/battleStore';
import { convertBattleChatToMessage } from '../utils/convertChatMessage';

export function useBattleChat() {
  const socket = useBattleStore(selectSocket);
  const userId = useBattleStore(selectUserId);
  const battleId = useBattleStore(selectBattleId);
  const team = useBattleStore(selectSelectedTeam);
  const chats = useBattleStore(selectChats);
  const addChat = useBattleStore((state) => state.addChat);

  // store의 chats를 필터링/변환만 수행
  const teamMessages = useMemo(
    () => chats.filter((chat) => chat.scope === 'TEAM').map((chat) => convertBattleChatToMessage(chat, userId)),
    [chats, userId]
  );

  const allMessages = useMemo(
    () => chats.filter((chat) => chat.scope === 'ALL').map((chat) => convertBattleChatToMessage(chat, userId)),
    [chats, userId]
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

      socket.emit('battle:chat', chatMessage);
    },
    [socket, battleId, team]
  );

  return {
    teamMessages,
    allMessages,
    sendMessage
  };
}
