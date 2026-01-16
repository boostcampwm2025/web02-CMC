import { useEffect, useCallback, useMemo } from 'react';
import type { BattleChat } from '@/commons/types/battle';
import {
  useBattleStore,
  selectSocket,
  selectBattleId,
  selectSelectedTeam,
  selectTeamChats,
  selectAllChats,
  selectOpponentNotice
} from '../stores/battleStore';
import { convertBattleChatToMessage } from '../utils/convertChatMessage';
import { selectUser, useAuthStore } from '../stores/authStore';
export function useBattleChat() {
  const socket = useBattleStore(selectSocket);
  const battleId = useBattleStore(selectBattleId);
  const team = useBattleStore(selectSelectedTeam);
  const teamChats = useBattleStore(selectTeamChats);
  const allChats = useBattleStore(selectAllChats);
  const opponentNoticeChat = useBattleStore(selectOpponentNotice);
  const addChat = useBattleStore((state) => state.addChat);
  const user = useAuthStore(selectUser);

  // 팀 채팅
  const teamMessages = useMemo(() => {
    if (!user) return [];
    const myTeamChats = teamChats
      .filter((chat) => chat.team === team && chat.scope === 'TEAM' && (!chat.type || chat.type === 'chat'))
      .map((chat) => convertBattleChatToMessage(chat, user.id));

    return myTeamChats.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [teamChats, team, user]);
  // 전체 채팅

  const allMessages = useMemo(() => {
    if (!user) return [];
    const filtered = allChats.filter(
      (chat) => !(team !== 'NONE' && chat.team !== team && (chat.type === 'attack' || chat.type === 'defense'))
    );
    return filtered.map((chat) => convertBattleChatToMessage(chat, user.id));
  }, [allChats, team, user]);

  const opponentNotice = useMemo(() => {
    if (!user) return null;

    if (team === 'NONE' || !opponentNoticeChat) return null;
    return convertBattleChatToMessage(opponentNoticeChat, user.id);
  }, [opponentNoticeChat, team, user]);
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
      if (!socket || !user) return;
      const chatMessage = {
        battleId,
        scope,
        team,
        text: content.trim()
      };
      const optimisticMessage: BattleChat = {
        messageId: `temp-${Date.now()}`,
        battleId,
        sender: {
          userId: user.id,
          nickname: user.nickname
        },
        team,
        scope,
        text: content.trim(),
        createdAt: new Date().toISOString() as any
      };
      addChat(optimisticMessage);
      socket.emit('battle:chat', chatMessage);
    },
    [socket, battleId, team, user, addChat]
  );
  return {
    teamMessages,
    allMessages,
    opponentNotice,
    sendMessage
  };
}
