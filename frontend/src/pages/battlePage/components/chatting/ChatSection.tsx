import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import ObjectionMessage from './ObjectionMessage';
import ChatTabs from './ChatTabs';
import PeoplesIcons from '@/assets/icon/peoples.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import type { BattleChat } from '@/commons/types/battle';

interface Message {
  id: string;
  user: string;
  team: 'A' | 'B' | 'NONE';
  content: string;
  timestamp: string;
  type?: 'normal' | 'objection' | 'rebuttal';
}

const MOCK_TEAM_MESSAGES: Message[] = [
  {
    id: '1',
    user: 'CodeMaster',
    team: 'A',
    content: '구현스가 Set을 사용해서 더 간결하네요',
    timestamp: '2025-12-16 21:30:00',
    type: 'normal'
  },
  {
    id: '2',
    user: 'JSLover',
    team: 'A',
    content: 'Set 사용이 훨씬 직관적인 것 같은데요',
    timestamp: '2025-12-16 21:31:00',
    type: 'normal'
  },
  {
    id: '3',
    user: 'You',
    team: 'A',
    content: '코드가 구려요',
    timestamp: '2025-12-16 21:32:00',
    type: 'objection'
  },
  {
    id: '4',
    user: 'You',
    team: 'A',
    content: '별론데요',
    timestamp: '2025-12-16 21:32:30',
    type: 'normal'
  }
];

const MOCK_ALL_MESSAGES: Message[] = [
  {
    id: '1',
    user: 'PlayerB',
    team: 'B',
    content: 'B팀도 나쁘지 않은데요?',
    timestamp: '2025-12-16 21:30:30',
    type: 'objection'
  },
  {
    id: '2',
    user: 'CodeMaster',
    team: 'A',
    content: 'A팀이 더 나은 것 같습니다',
    timestamp: '2025-12-16 21:31:00',
    type: 'rebuttal'
  },
  {
    id: '3',
    user: 'Observer',
    team: 'NONE',
    content: '둘 다 장단점이 있네요',
    timestamp: '2025-12-16 21:31:30',
    type: 'normal'
  }
];

interface ChatSectionProps {
  socket: Socket | null;
  battleId?: string;
  chats: BattleChat[];
  allChats: BattleChat[];
  aTeamMemebers: number;
  onSendMessage?: (content: string) => void;
  team: 'A' | 'B' | 'NONE';
}

export default function ChatSection({
  socket,
  aTeamMemebers,
  onSendMessage,
  team,
  battleId,
  chats,
  allChats
}: ChatSectionProps) {
  const [teamMessages, setTeamMessages] = useState<Message[]>(MOCK_TEAM_MESSAGES);
  const [allMessages, setAllMessages] = useState<Message[]>(MOCK_ALL_MESSAGES);
  const [activeTab, setActiveTab] = useState<'team' | 'all'>(team === 'NONE' ? 'all' : 'team');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentMessages = useMemo(() => {
    return activeTab === 'team' ? teamMessages : allMessages;
  }, [activeTab, teamMessages, allMessages]);

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
    socket?.on('battle:chatUpdate', handleChatUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

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
            {aTeamMemebers}
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
            />
          )
        )}
      </div>
      <ChatInput onSend={handleSendMessage} />
    </section>
  );
}
