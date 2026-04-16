import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Message } from '@/features/battle/utils/convertChatMessage';

interface UseUnreadMessagesProps {
  teamMessages: Message[];
  allMessages: Message[];
  currentTab: 'team' | 'all';
  chatInitialized: boolean;
}

export function useUnreadMessages({ teamMessages, allMessages, currentTab, chatInitialized }: UseUnreadMessagesProps) {
  const initializedRef = useRef(false);
  const [lastReadIds, setLastReadIds] = useState({ team: '', all: '' });

  const currentMessages = currentTab === 'team' ? teamMessages : allMessages;

  // 채팅 초기화 시 마지막 메시지를 읽음으로 표시
  useEffect(() => {
    if (initializedRef.current || !chatInitialized) return;
    setLastReadIds({
      team: teamMessages[teamMessages.length - 1]?.id ?? '',
      all: allMessages[allMessages.length - 1]?.id ?? ''
    });
    initializedRef.current = true;
  }, [teamMessages, allMessages, chatInitialized]);

  // 현재 탭의 메시지를 읽음으로 표시
  useEffect(() => {
    const lastId = currentMessages[currentMessages.length - 1]?.id ?? '';
    if (!lastId) return;
    setLastReadIds((prev) => (prev[currentTab] === lastId ? prev : { ...prev, [currentTab]: lastId }));
  }, [currentMessages, currentTab]);

  const getUnreadCount = useCallback((messages: Message[], lastReadId: string) => {
    if (messages.length === 0) return 0;
    const lastReadIndex = lastReadId ? messages.findIndex((message) => message.id === lastReadId) : -1;
    return messages.slice(lastReadIndex + 1).length;
  }, []);

  const unreadTeamCount = useMemo(
    () => getUnreadCount(teamMessages, lastReadIds.team),
    [teamMessages, lastReadIds.team, getUnreadCount]
  );

  const unreadAllCount = useMemo(
    () => getUnreadCount(allMessages, lastReadIds.all),
    [allMessages, lastReadIds.all, getUnreadCount]
  );

  // 현재 탭의 읽지 않은 메시지는 0으로 표시
  const unreadTeamDisplay = currentTab === 'team' ? 0 : unreadTeamCount;
  const unreadAllDisplay = currentTab === 'all' ? 0 : unreadAllCount;

  return {
    unreadTeamCount: unreadTeamDisplay,
    unreadAllCount: unreadAllDisplay
  };
}
