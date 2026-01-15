import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import DiscussionMessage from './DiscussionMessage';
import ChatTabs from './ChatTabs';
import PeoplesIcons from '@/assets/icon/peoples.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  useBattleStore,
  selectUserId,
  selectSelectedTeam,
  selectTeamCounts,
  selectChatInitialized
} from '../../stores/battleStore';
import { useBattleChat } from '../../hooks/useBattleChat';
import { useAutoScrollDown } from '@/commons/hooks/useAutoScroll';

export default function ChatSection() {
  const userId = useBattleStore(selectUserId);
  const team = useBattleStore(selectSelectedTeam);
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);
  const chatInitialized = useBattleStore(selectChatInitialized);

  const [activeTab, setActiveTab] = useState<'team' | 'all'>('team');

  const { teamMessages, allMessages, opponentNotice, sendMessage } = useBattleChat();

  const currentTab = team === 'NONE' ? 'all' : activeTab;

  const currentMessages = useMemo(() => {
    return currentTab === 'team' ? teamMessages : allMessages;
  }, [currentTab, teamMessages, allMessages]);

  const initializedRef = useRef(false);
  const [lastReadIds, setLastReadIds] = useState({ team: '', all: '' });

  useEffect(() => {
    if (initializedRef.current || !chatInitialized) return;
    setLastReadIds({
      team: teamMessages[teamMessages.length - 1]?.id ?? '',
      all: allMessages[allMessages.length - 1]?.id ?? ''
    });
    initializedRef.current = true;
  }, [teamMessages, allMessages, chatInitialized]);

  useEffect(() => {
    const lastId = currentMessages[currentMessages.length - 1]?.id ?? '';
    if (!lastId) return;
    setLastReadIds((prev) => (prev[currentTab] === lastId ? prev : { ...prev, [currentTab]: lastId }));
  }, [currentMessages, currentTab]);

  const getUnreadCount = (messages: typeof teamMessages, lastReadId: string) => {
    if (messages.length === 0) return 0;
    const lastReadIndex = lastReadId ? messages.findIndex((message) => message.id === lastReadId) : -1;
    return messages.slice(lastReadIndex + 1).length;
  };

  const unreadTeamCount = useMemo(
    () => getUnreadCount(teamMessages, lastReadIds.team),
    [teamMessages, lastReadIds.team]
  );
  const unreadAllCount = useMemo(() => getUnreadCount(allMessages, lastReadIds.all), [allMessages, lastReadIds.all]);
  const unreadTeamDisplay = currentTab === 'team' ? 0 : unreadTeamCount;
  const unreadAllDisplay = currentTab === 'all' ? 0 : unreadAllCount;

  const chatContainerRef = useAutoScrollDown([currentMessages]);

  const currentMemberCount = useMemo(() => {
    if (currentTab === 'all') {
      return teamACount + teamBCount;
    }
    return team === 'A' ? teamACount : teamBCount;
  }, [currentTab, team, teamACount, teamBCount]);

  const handleSendMessage = (content: string) => {
    const scope = currentTab === 'team' ? 'TEAM' : 'ALL';
    sendMessage(content, scope);
  };

  return (
    <section className="w-full flex flex-col bg-[#1E1E2F] rounded-lg overflow-hidden mb-48" data-tutorial="chat">
      <div className="px-4 pt-3 pb-2 border-b border-[#2D2D3F]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageIcon />
            <h3 className="text-[14px] font-medium text-white">라운지</h3>
          </div>
          <span className="text-[12px] text-[#99A1AF] flex items-center gap-1">
            <PeoplesIcons />
            {currentMemberCount}
          </span>
        </div>

        <ChatTabs
          activeTab={currentTab}
          onTabChange={setActiveTab}
          team={team}
          unreadTeamCount={unreadTeamDisplay}
          unreadAllCount={unreadAllDisplay}
        />
      </div>

      {opponentNotice && team !== 'NONE' && (
        <DiscussionMessage
          user={opponentNotice.user}
          team={opponentNotice.team}
          content={opponentNotice.content}
          timestamp={opponentNotice.timestamp}
          type={opponentNotice.type === 'defense' ? 'defense' : 'attack'}
          votes={opponentNotice.votes}
        />
      )}

      <div ref={chatContainerRef} className="h-[422px] px-4 py-2 overflow-y-auto scrollbar-thin">
        {currentMessages.map((message) =>
          message.type === 'attack' || message.type === 'defense' ? (
            <DiscussionMessage
              key={message.id}
              user={message.user}
              team={message.team}
              content={message.content}
              timestamp={message.timestamp}
              type={message.type}
              votes={message.votes}
            />
          ) : (
            <ChatMessage
              key={message.id}
              user={message.user}
              team={message.team}
              content={message.content}
              timestamp={message.timestamp}
              showTeamBadge={currentTab === 'all'}
              currentUserId={userId}
            />
          )
        )}
      </div>
      <ChatInput onSend={handleSendMessage} />
    </section>
  );
}
