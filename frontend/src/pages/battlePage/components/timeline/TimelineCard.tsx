import LikeIcon from '@/assets/icon/like.svg?react';

interface TimelineCardProps {
  user: string;
  team: 'A' | 'B';
  type: '이의제기' | '반박';
  content: string;
  timestamp: string;
  voteCount: number;
}

const TYPE_COLORS = {
  이의제기: {
    bg: 'bg-[#82181A]/20',
    border: 'border-[#FB2C36]'
  },
  반박: {
    bg: 'bg-[#0D542B]/20',
    border: 'border-[#00C950]'
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

export default function TimelineCard({ user, team, type, content, voteCount }: TimelineCardProps) {
  const typeColors = TYPE_COLORS[type];
  const teamColors = TEAM_COLORS[team];

  return (
    <div className={`w-[1143px] ${typeColors.bg} ${typeColors.border} border-[2px] rounded-lg p-4 shadow-xl`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-[36px] h-[24px] ${teamColors.badge} rounded-sm flex items-center justify-center text-white font-bold text-[12px]`}
          >
            {team}팀
          </div>
          <span className={`text-[15px] font-bold ${teamColors.text}`}>{user}</span>
        </div>

        <div className="flex items-center gap-2 text-white rounded-md px-2 py-1 bg-[#2D2D3F]">
          <LikeIcon className="w-[20px] h-[20px]" />
          <span className="text-[13px] text-white font-medium">{voteCount}</span>
        </div>
      </div>

      <p className="text-[16px] text-start text-white pl-[12px]">{content}</p>
    </div>
  );
}
