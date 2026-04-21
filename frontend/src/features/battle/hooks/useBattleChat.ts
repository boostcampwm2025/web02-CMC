import { useEffect, useCallback, useMemo } from 'react';
import type { BattleChat } from '@/commons/types/battle';
import { BATTLE_CLIENT_EVENTS, BATTLE_SERVER_EVENTS } from '@cmc/types';
import {
  useBattleStore,
  selectSocket,
  selectBattleId,
  selectSelectedTeam,
  selectTeamChats,
  selectAllChats,
  selectOpponentNotice
} from '@/features/battle/stores/battleStore';
import { convertBattleChatToMessage } from '@/features/battle/utils/convertChatMessage';
import { selectUser, useAuthStore } from '@/commons/stores/authStore';
export function useBattleChat() {
  const socket = useBattleStore(selectSocket);
  const battleId = useBattleStore(selectBattleId);
  const team = useBattleStore(selectSelectedTeam);
  const teamChats = useBattleStore(selectTeamChats);
  const allChats = useBattleStore(selectAllChats);
  const opponentNoticeChat = useBattleStore(selectOpponentNotice);
  const addChat = useBattleStore((state) => state.addChat);
  const user = useAuthStore(selectUser);

  const teamMessages = useMemo(() => {
    if (!user) return [];

    const myTeamChats = teamChats.map((chat) => convertBattleChatToMessage(chat));

    return myTeamChats.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [teamChats, user]);

  const allMessages = useMemo(() => {
    if (!user) return [];
    const filtered = allChats.filter(
      (chat) => !(team !== 'NONE' && chat.team !== team && (chat.type === 'attack' || chat.type === 'defense'))
    );
    return filtered.map((chat) => convertBattleChatToMessage(chat));
  }, [allChats, team, user]);

  const opponentNotice = useMemo(() => {
    if (!user) return null;

    if (team === 'NONE' || !opponentNoticeChat) return null;
    return convertBattleChatToMessage(opponentNoticeChat);
  }, [opponentNoticeChat, team, user]);

  useEffect(() => {
    if (!socket) return;
    const handleChatUpdate = (message: BattleChat) => {
      addChat(message);
    };
    socket.on(BATTLE_SERVER_EVENTS.CHATTED, handleChatUpdate);
    return () => {
      socket.off(BATTLE_SERVER_EVENTS.CHATTED, handleChatUpdate);
    };
  }, [socket, addChat]);

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
          nickname: user.nickname,
          tier: user.tier
        },
        team,
        scope,
        text: content.trim(),
        createdAt: new Date().toISOString()
      };
      addChat(optimisticMessage);
      socket.emit(BATTLE_CLIENT_EVENTS.CHAT, chatMessage);
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
