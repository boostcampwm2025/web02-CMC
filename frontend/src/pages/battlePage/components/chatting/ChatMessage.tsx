import { getTimeAgo } from '@/utils/getTimeAgo';

interface ChatMessageProps {
  user: string;
  team: 'A' | 'B' | 'none';
  content: string;
  timestamp: string;
}

const TEAM_NICKNAME_COLORS = {
  A: 'text-[#51A2FF]',
  B: 'text-[#FF5A5F]',
  none: 'text-[#99A1AF]'
};

export default function ChatMessage({ user, team, content, timestamp }: ChatMessageProps) {
  const nickNameColor = TEAM_NICKNAME_COLORS[team];
  const isYou = user === 'You';

  return (
    <div className={`flex ${isYou ? 'flex-col items-end' : 'flex-col items-start'} mb-3`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[13px] font-medium ${nickNameColor}`}>{user}</span>
        <span className="text-[11px] text-[#666]">{getTimeAgo(timestamp)}</span>
      </div>
      <div className={`flex items-center gap-2 ${isYou ? 'flex-row-reverse' : ''}`}>
        <div className={`${isYou ? 'bg-[#6B3410]' : 'bg-[#2D2D3F]'} rounded-lg px-3 py-2 max-w-[280px]`}>
          <p className="text-[13px] text-white">{content}</p>
        </div>
      </div>
    </div>
  );
}
