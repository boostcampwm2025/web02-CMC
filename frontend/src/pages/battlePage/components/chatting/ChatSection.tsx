import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import ChatTabs from './ChatTabs';
import PeoplesIcons from '@/assets/icon/peoples.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  user: string;
  team: 'A' | 'B' | 'none';
  content: string;
  timestamp: string;
  isObjection?: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    user: 'CodeMaster',
    team: 'A',
    content: '구현스가 Set을 사용해서 더 간결하네요',
    timestamp: '2025-12-16 21:30:00'
  },
  {
    id: 2,
    user: 'JSLover',
    team: 'A',
    content: 'Set 사용이 훨씬 직관적인 것 같은데요',
    timestamp: '2025-12-16 21:31:00'
  },
  {
    id: 3,
    user: 'You',
    team: 'A',
    content: '코드가 구려요',
    timestamp: '2025-12-16 21:32:00'
  },
  {
    id: 4,
    user: 'You',
    team: 'A',
    content: '별론데요',
    timestamp: '2025-12-16 21:32:30'
  }
];

interface ChatSectionProps {
  aTeamMemebers: number;
  onSendMessage?: (content: string) => void;
  team: 'A' | 'B';
}

export default function ChatSection({ aTeamMemebers, onSendMessage, team }: ChatSectionProps) {
  const [message, setMessage] = useState<Message[]>(MOCK_MESSAGES);
  const [activeTab, setActiveTab] = useState<'team' | 'all'>('team');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [message]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: message.length + 1,
      user: 'You',
      team: 'A',
      content,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setMessage((prev) => [...prev, newMessage]);

    if (onSendMessage) {
      onSendMessage(content);
    }
  };

  /*Todo 채팅 소켓 구동 이벤트로직 필요.
    setMessage()
  */

  return (
    <section className="w-[500px] flex flex-col bg-[#1E1E2F] rounded-lg overflow-hidden">
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
        {message.map((message) => (
          <ChatMessage
            key={message.id}
            user={message.user}
            team={message.team}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}
      </div>
      <ChatInput onSend={handleSendMessage} />
    </section>
  );
}
