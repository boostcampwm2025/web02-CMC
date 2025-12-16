import { getTimeAgo } from '@/utils/getTimeAgo';

interface ChatMessageProps {
  user: string;
  team: 'A' | 'B' | 'none';
  content: string;
  timestamp: string;
  showTeamBadge?: boolean;
}

const TEAM_NICKNAME_COLORS = {
  A: 'text-[#51A2FF]',
  B: 'text-[#FF5A5F]',
  none: 'text-[#99A1AF]'
};

const TEAM_BADGE_COLORS = {
  A: 'bg-[#51A2FF]',
  B: 'bg-[#FF5A5F]',
  none: 'bg-[#99A1AF]'
};

const TEAM_LABELS = {
  A: 'A팀',
  B: 'B팀',
  none: '중립'
};

export default function ChatMessage({ user, team, content, timestamp, showTeamBadge = false }: ChatMessageProps) {
  const nickNameColor = TEAM_NICKNAME_COLORS[team];
  const isYou = user === 'You';

  return (
    <div className={`flex ${isYou ? 'flex-col items-end' : 'flex-col items-start'} mb-3`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[13px] font-medium ${nickNameColor}`}>{user}</span>
        {showTeamBadge && (
          <span className={`px-1.5 py-0.5 ${TEAM_BADGE_COLORS[team]} rounded text-[10px] font-medium text-white`}>
            {TEAM_LABELS[team]}
          </span>
        )}
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
