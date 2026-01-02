import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import ObjectionMessage from './ObjectionMessage';
import ChatTabs from './ChatTabs';
import PeoplesIcons from '@/assets/icon/peoples.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { BattleChat } from '@/commons/types/battle';
import {
  useBattleStore,
  selectSocket,
  selectUserId,
  selectBattleId,
  selectSelectedTeam,
  selectChats,
  selectTeamCounts
} from '../../stores/battleStore';

interface Message {
  id: string;
  user: string;
  team: 'A' | 'B' | 'NONE';
  content: string;
  timestamp: string;
  type?: 'normal' | 'objection' | 'rebuttal';
}

interface ChatSectionProps {
  onSendMessage?: (content: string) => void;
}

export default function ChatSection({ onSendMessage }: ChatSectionProps) {
  const socket = useBattleStore(selectSocket);
  const userId = useBattleStore(selectUserId);
  const battleId = useBattleStore(selectBattleId);
  const team = useBattleStore(selectSelectedTeam);
  const chats = useBattleStore(selectChats);
  const teamCounts = useBattleStore(selectTeamCounts);

  const teamACounts = teamCounts?.teamA || 0;
  const teamBCounts = teamCounts?.teamB || 0;
  const allChats = chats || [];
  const [teamMessages, setTeamMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'team' | 'all'>(team === 'NONE' ? 'all' : 'team');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentMessages = useMemo(() => {
    return activeTab === 'team' ? teamMessages : allMessages;
  }, [activeTab, teamMessages, allMessages]);

  const currentMemberCount = useMemo(() => {
    if (activeTab === 'all') {
      return teamACounts + teamBCounts;
    }
    return team === 'A' ? teamACounts : teamBCounts;
  }, [activeTab, team, teamACounts, teamBCounts]);

  useEffect(() => {
    const newChats =
      chats?.map(
        (chat: BattleChat): Message => ({
          id: chat.messageId,
          user: chat.sender,
          team: chat.team,
          content: chat.text,
          timestamp: new Date(chat.createdAt).toISOString().replace('T', ' ').substring(0, 19),
          type: 'normal'
        })
      ) ?? [];

    const newAllchats =
      allChats?.map(
        (chat: BattleChat): Message => ({
          id: chat.messageId,
          user: chat.sender,
          team: chat.team,
          content: chat.text,
          timestamp: new Date(chat.createdAt).toISOString().replace('T', ' ').substring(0, 19),
          type: 'normal'
        })
      ) ?? [];

    setTeamMessages((prev) => [...prev, ...newChats]);
    setAllMessages((prev) => [...prev, ...newAllchats]);
  }, [chats, allChats]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleChatUpdate = (message: BattleChat) => {
      const newMessage: Message = {
        id: message.messageId,
        user: message.sender,
        team: message.team,
        content: message.text,
        timestamp: new Date(message.createdAt).toISOString().replace('T', ' ').substring(0, 19),
        type: 'normal'
      };

      if (message.scope === 'TEAM') {
        setTeamMessages((prev) => [...prev, newMessage]);
      } else {
        setAllMessages((prev) => [...prev, newMessage]);
      }

      if (onSendMessage) {
        onSendMessage(newMessage.content);
      }
    };

    socket.on('battle:chatUpdate', handleChatUpdate);

    return () => {
      socket.off('battle:chatUpdate', handleChatUpdate);
    };
  }, [socket, onSendMessage]);

  const handleSendMessage = (content: string) => {
    if (!socket) return;

    const scope = activeTab === 'team' ? 'TEAM' : 'ALL';

    const chatMessage = {
      battleId,
      scope,
      team,
      text: content.trim()
    };

    socket.emit('battle:chat', chatMessage);

    const newMessage: Message = {
      id: currentMessages.length + 1 + '',
      user: 'You',
      team: team,
      content,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'normal'
    };

    if (activeTab === 'team') {
      setTeamMessages((prev) => [...prev, newMessage]);
    } else {
      setAllMessages((prev) => [...prev, newMessage]);
    }
    if (onSendMessage) {
      onSendMessage(content);
    }
  };

  /*Todo 채팅 소켓 구동 이벤트로직 필요.
    setTeamMessages() / setAllMessages()
  */

  return (
    <section className="w-full flex flex-col bg-[#1E1E2F] rounded-lg overflow-hidden">
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

        <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} team={team} />
      </div>

      <div ref={chatContainerRef} className="h-[422px] px-4 py-2 overflow-y-auto scrollbar-thin">
        {currentMessages.map((message) =>
          message.type === 'objection' || message.type === 'rebuttal' ? (
            <ObjectionMessage
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
              showTeamBadge={activeTab === 'all'}
              currentUserId={userId}
            />
          )
        )}
      </div>
      <ChatInput onSend={handleSendMessage} />
    </section>
  );
}
