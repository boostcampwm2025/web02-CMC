import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import DiscussionMessage from './DiscussionMessage';
import ChatTabs from './ChatTabs';
import PeoplesIcons from '@/assets/icon/peoples.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';

import { useState, useMemo } from 'react';
import { useBattleStore, selectUserId, selectSelectedTeam, selectTeamCounts } from '../../stores/battleStore';
import { useBattleChat } from '../../hooks/useBattleChat';
import { useAutoScrollDown } from '@/commons/hooks/useAutoScroll';

export default function ChatSection() {
  const userId = useBattleStore(selectUserId);
  const team = useBattleStore(selectSelectedTeam);
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);

  const [activeTab, setActiveTab] = useState<'team' | 'all'>('team');

  const { teamMessages, allMessages, sendMessage } = useBattleChat();

  const currentTab = team === 'NONE' ? 'all' : activeTab;

  const currentMessages = useMemo(() => {
    return currentTab === 'team' ? teamMessages : allMessages;
  }, [currentTab, teamMessages, allMessages]);

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

        <ChatTabs activeTab={currentTab} onTabChange={setActiveTab} team={team} />
      </div>

      <div ref={chatContainerRef} className="h-[422px] px-4 py-2 overflow-y-auto scrollbar-thin">
        {currentMessages.map((message) =>
          message.type === 'attack' || message.type === 'defense' ? (
            <DiscussionMessage
              key={message.id}
              team={message.team}
              content={message.content}
              timestamp={message.timestamp}
              type={message.type}
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
