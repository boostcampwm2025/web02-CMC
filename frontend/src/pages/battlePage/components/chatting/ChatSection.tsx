import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import DiscussionMessage from './DiscussionMessage';
import ChatTabs from './ChatTabs';
import PeoplesIcons from '@/assets/icon/peoples.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';

import { useState, useMemo } from 'react';
import { useBattleStore, selectSelectedTeam, selectTeamCounts, selectChatInitialized } from '../../stores/battleStore';
import { useBattleChat } from '../../hooks/useBattleChat';
import { useAutoScrollDown } from '@/commons/hooks/useAutoScroll';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

export default function ChatSection() {
  // Store 상태
  const team = useBattleStore(selectSelectedTeam);
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);
  const chatInitialized = useBattleStore(selectChatInitialized);

  // 로컬 상태
  const [activeTab, setActiveTab] = useState<'team' | 'all'>('team');
  const currentTab = team === 'NONE' ? 'all' : activeTab;

  // 채팅 데이터
  const { teamMessages, allMessages, opponentNotice, sendMessage } = useBattleChat();
  const currentMessages = useMemo(() => {
    return currentTab === 'team' ? teamMessages : allMessages;
  }, [currentTab, teamMessages, allMessages]);

  // 읽지 않은 메시지
  const { unreadTeamCount, unreadAllCount } = useUnreadMessages({
    teamMessages,
    allMessages,
    currentTab,
    chatInitialized
  });

  // UI 상태
  const chatContainerRef = useAutoScrollDown([currentMessages]);
  const currentMemberCount = currentTab === 'all' ? teamACount + teamBCount : team === 'A' ? teamACount : teamBCount;

  // 이벤트 핸들러
  const handleSendMessage = (content: string) => {
    const scope = currentTab === 'team' ? 'TEAM' : 'ALL';
    sendMessage(content, scope);
  };

  return (
    <section className="w-full flex flex-col bg-[#1E1E2F] rounded-lg overflow-hidden" data-tutorial="chat">
      <div className="px-4 pt-3 pb-2 border-b border-[#2D2D3F]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageIcon />
            <h3 className="text-sm font-medium text-white">라운지</h3>
          </div>
          <span className="text-xs text-[#99A1AF] flex items-center gap-1">
            <PeoplesIcons />
            {currentMemberCount}
          </span>
        </div>

        <ChatTabs
          activeTab={currentTab}
          onTabChange={setActiveTab}
          team={team}
          unreadTeamCount={unreadTeamCount}
          unreadAllCount={unreadAllCount}
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

      <div ref={chatContainerRef} className="h-[26.375rem] px-4 py-2 overflow-y-auto scrollbar-thin">
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
            />
          )
        )}
      </div>
      <ChatInput onSend={handleSendMessage} />
    </section>
  );
}
