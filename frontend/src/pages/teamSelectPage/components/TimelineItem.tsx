import type { TimelineItem as TimelineItemType } from '../types/teamSelect';
import Like from '@/assets/icon/like.svg?react';

const TYPE_STYLES = {
  ATTACK: {
    border: 'border-[#4CAF50]',
    bgColor: 'bg-[#1E3A1E]'
  },
  DEFENSE: {
    border: 'border-[#FB2C36]',
    bgColor: 'bg-[#3A1E1E]'
  }
};

const TEAM_STYLES = {
  A: {
    badge: 'bg-[#155DFC]',
    text: 'text-[#51A2FF]'
  },
  B: {
    badge: 'bg-[#E7000B]',
    text: 'text-[#FF5A5F]'
  }
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

export default function TimelineItem({ type, team, author, content, upvotes, timestamp }: TimelineItemType) {
  const typeStyle = TYPE_STYLES[type];
  const teamStyle = TEAM_STYLES[team];

  return (
    <div className={`border-2 rounded-lg p-4 ${typeStyle.border} ${typeStyle.bgColor}`}>
      {/* 헤더: 작성자 + 팀 배지 + 시간 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{author}</span>
          <span className={`px-2 py-1 rounded text-xs text-white ${teamStyle.badge}`}>{team}팀</span>
        </div>
        <span className="text-[#99A1AF] text-xs">{formatRelativeTime(timestamp)}</span>
      </div>

      {/* 내용 */}
      <p className="text-[#E0E0E0] text-sm mb-3">{content}</p>

      {/* 좋아요 */}
      <div className="flex items-center gap-1">
        <Like className="w-4 h-4 text-[#99A1AF]" />
        <span className="text-[#99A1AF] text-xs">{upvotes}</span>
      </div>
    </div>
  );
}
