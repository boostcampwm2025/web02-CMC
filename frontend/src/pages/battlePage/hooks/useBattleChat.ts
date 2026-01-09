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

  // 팀 채팅
  const teamMessages = useMemo(() => {
    // 1. 내 팀의 일반 채팅 메시지
    const myTeamChats = teamChats
      .filter((chat) => chat.team === team && chat.scope === 'TEAM' && (!chat.type || chat.type === 'chat'))
      .map((chat) => convertBattleChatToMessage(chat, userId));

    // 2. 상대 팀의 attack/defense 메시지
    const opponentAttackDefense = allChats
      .filter((chat) => chat.team !== team && team !== 'NONE' && (chat.type === 'attack' || chat.type === 'defense'))
      .map((chat) => convertBattleChatToMessage(chat, userId));

    // 메시지 ID 기준으로 중복 제거하며 병합
    const messageMap = new Map();
    [...myTeamChats, ...opponentAttackDefense].forEach((msg) => {
      messageMap.set(msg.id, msg);
    });

    // 시간순으로 정렬 (timestamp 기준)
    return Array.from(messageMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [teamChats, allChats, team, userId]);
  // 전체 채팅

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
    socket.on('battle:chatted', handleChatUpdate);
    return () => {
      socket.off('battle:chatted', handleChatUpdate);
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
