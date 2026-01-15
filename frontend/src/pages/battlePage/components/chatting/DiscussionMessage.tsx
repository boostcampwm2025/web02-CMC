import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';
import VoteIcon from '@/assets/icon/vote.svg?react';

interface DiscussionMessageProps {
  user: string;
  team: 'A' | 'B' | 'NONE';
  content: string;
  timestamp: string;
  type: 'attack' | 'defense';
  votes?: number;
}

const TEAM_TEXT_COLORS = {
  A: 'text-blue-400',
  B: 'text-red-400',
  NONE: 'text-gray-400'
};

const TEAM_GRADIENTS = {
  A: 'bg-gradient-to-r from-blue-600/25 via-blue-500/10 to-transparent',
  B: 'bg-gradient-to-r from-red-600/25 via-red-500/10 to-transparent',
  NONE: 'bg-gradient-to-r from-gray-600/10 via-gray-500/5 to-transparent'
};

const TEAM_BADGE_BG = {
  A: 'bg-blue-600',
  B: 'bg-red-600',
  NONE: 'bg-gray-600'
};

export default function DiscussionMessage({ user, team, content, type, votes }: DiscussionMessageProps) {
  const label = `${team}팀의 ${type === 'attack' ? '공격' : '반론'}`;
  const displayUser = user || 'SYSTEM';

  return (
    <div className={`px-4 py-2.5 border-b border-[#2d2d3f] ${TEAM_GRADIENTS[team]}`}>
      <div className="flex items-center gap-2.5">
        <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${TEAM_BADGE_BG[team]}`}>
          {type === 'attack' ? (
            <BattleIcon className="w-4 h-4 text-white" />
          ) : (
            <ShieldIcon className="w-4 h-4 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold ${TEAM_TEXT_COLORS[team]}`}>{label}</span>
            <span className="text-gray-500 text-xs">by {displayUser}</span>
          </div>
          <p className="text-gray-300 text-sm text-left whitespace-pre-wrap break-words">{content}</p>
        </div>

        {typeof votes === 'number' && (
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-orange-500/20 px-2.5 py-1 rounded-md border border-orange-500/30">
            <VoteIcon className="w-3 h-3 text-orange-400" />
            <span className="text-orange-400 text-sm font-bold">{votes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
