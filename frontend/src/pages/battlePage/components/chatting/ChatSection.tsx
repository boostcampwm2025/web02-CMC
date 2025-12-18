import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import PeoplesIcons from '@/assets/icon/peoples.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';

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
}

export default function ChatSection({ aTeamMemebers }: ChatSectionProps) {
  return (
    <section className="w-[500px] flex flex-col bg-[#1E1E2F] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D2D3F]">
        <div className="flex items-center gap-2">
          <MessageIcon />
          <h3 className="text-[14px] font-medium text-white">A팀 라운지</h3>
          <span className="px-2 py-0.5 bg-[#51A2FF] rounded text-[11px] font-medium text-white">A팀</span>
        </div>
        <span className="text-[12px] text-[#99A1AF] flex items-center gap-1">
          <PeoplesIcons />
          {aTeamMemebers}
        </span>
      </div>

      <div className=" h-[422px] px-4 py-2">
        {MOCK_MESSAGES.map((message) => (
          <ChatMessage
            key={message.id}
            user={message.user}
            team={message.team}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}
      </div>
      <ChatInput />
    </section>
  );
}
