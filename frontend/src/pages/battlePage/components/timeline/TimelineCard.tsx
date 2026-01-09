import LikeIcon from '@/assets/icon/like.svg?react';
import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';
import type { BattleDiscussion } from '@/commons/types/battle';

interface TimelineCardProps {
  discussionDetails: BattleDiscussion;
}

const TYPE_COLORS = {
  이의제기: {
    bg: 'bg-[#82181A]/20',
    margin: 'ml-0',
    border: 'border-[#FB2C36]',
    icon: 'text-[#05DF72]'
  },
  반박: {
    bg: 'bg-[#0D542B]/20',
    margin: 'ml-16',
    border: 'border-[#00C950]',
    icon: 'text-[#FF6467]'
  }
};

const TEAM_COLORS = {
  A: {
    badge: 'bg-[#2B7FFF]',
    text: 'text-[#51A2FF]'
  },
  B: {
    badge: 'bg-[#FB2C36]',
    text: 'text-[#FF5A5F]'
  }
};

export default function TimelineCard({ discussionDetails }: TimelineCardProps) {
  const { authorId, content, upvotes, type, team } = discussionDetails;
  const discussionType = type === 'ATTACK' ? '이의제기' : '반박';
  const typeColors = TYPE_COLORS[discussionType];
  const teamColors = TEAM_COLORS[team];

  return (
    <div
      className={`w-[85%] ${typeColors.bg} ${typeColors.border} ${typeColors.margin} border-2 rounded-lg p-4 shadow-xl`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-[36px] h-[20px] ${teamColors.badge} rounded-sm flex items-center justify-center text-white font-bold text-[12px] mb-2`}
          >
            {team}팀
          </div>
          <span className={`text-[18px] font-bold ${teamColors.text}`}>{authorId}</span>
          {discussionType === '이의제기' ? (
            <BattleIcon className={`w-[20px] h-[20px] ${typeColors.icon}`} />
          ) : (
            <ShieldIcon className={`w-[20px] h-[20px] ${typeColors.icon}`} />
          )}
          <span className={`text-[14px] font-medium ${typeColors.icon}`}>{discussionType}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md px-2 py-1 bg-[#2D2D3F]">
          <LikeIcon className="w-[20px] h-[20px]" />
          <span className="text-[13px] text-white font-medium">{upvotes}</span>
        </div>
      </div>
      <p className="text-[16px] text-white pl-[12px] text-left">{content}</p>
    </div>
  );
}
