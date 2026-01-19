import { getTimeAgo } from '@/commons/utils/getTimeAgo';
import { useAuthStore, selectUser } from '../../stores/authStore';

interface ChatMessageProps {
  user: string;
  team: 'A' | 'B' | 'NONE';
  content: string;
  timestamp: string;
  showTeamBadge?: boolean;
  type?: 'normal' | 'objection' | 'rebuttal';
}

const TEAM_NICKNAME_COLORS = {
  A: 'text-[#51A2FF]',
  B: 'text-[#FF5A5F]',
  NONE: 'text-[#99A1AF]'
};

const TEAM_BADGE_COLORS = {
  A: 'bg-[#51A2FF]',
  B: 'bg-[#FF5A5F]',
  NONE: 'bg-[#99A1AF]'
};

const TEAM_LABELS = {
  A: 'A팀',
  B: 'B팀',
  NONE: '중립'
};

export default function ChatMessage({ user, team, content, timestamp, showTeamBadge = false }: ChatMessageProps) {
  const currentUser = useAuthStore(selectUser);
  const nickNameColor = TEAM_NICKNAME_COLORS[team];
  const isYou = currentUser?.nickname === user;

  return (
    <div className={`flex ${isYou ? 'flex-col items-end' : 'flex-col items-start'} mb-3`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-medium ${nickNameColor}`}>{user}</span>
        {showTeamBadge && (
          <span className={`px-1.5 py-0.5 ${TEAM_BADGE_COLORS[team]} rounded text-[0.625rem] font-medium text-white`}>
            {TEAM_LABELS[team]}
          </span>
        )}
        <span className="text-[0.688rem] text-[#666]">{getTimeAgo(timestamp)}</span>
      </div>
      <div className={`flex items-center gap-2 ${isYou ? 'flex-row-reverse' : ''}`}>
        <div className={`${isYou ? 'bg-[#6B3410]' : 'bg-[#2D2D3F]'}  rounded-lg px-3 py-2 max-w-[17.5rem]`}>
          <p className="text-xs text-white">{content}</p>
        </div>
      </div>
    </div>
  );
}
