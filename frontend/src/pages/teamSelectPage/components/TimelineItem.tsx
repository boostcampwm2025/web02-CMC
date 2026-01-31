import type { TimelineItem as TimelineItemType } from '../types/teamSelect';
import Like from '@/assets/icon/like.svg?react';
import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';

interface TimelineItemProps extends TimelineItemType {
  allTimelines: TimelineItemType[];
}

const TYPE_STYLES = {
  ATTACK: {
    border: 'border-[#4CAF50]',
    bgColor: 'bg-[#1E3A1E]',
    icon: 'text-[#4CAF50]',
    label: '이의제기'
  },
  DEFENSE: {
    border: 'border-[#FB2C36]',
    bgColor: 'bg-[#3A1E1E]',
    icon: 'text-[#FB2C36]',
    label: '반론'
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

export default function TimelineItem({
  type,
  team,
  author,
  content,
  upvotes,
  timestamp,
  attackId,
  allTimelines
}: TimelineItemProps) {
  const typeStyle = TYPE_STYLES[type];
  const teamStyle = TEAM_STYLES[team];

  // 반론인 경우 연결된 이의제기 찾기
  const relatedAttack =
    type === 'DEFENSE' && attackId ? allTimelines.find((item) => item.id === attackId && item.type === 'ATTACK') : null;

  return (
    <div className={`border-2 rounded-lg p-4 ${typeStyle.border} ${typeStyle.bgColor}`}>
      {/* 헤더: 타입 아이콘 + 라벨 + 작성자 + 팀 배지 + 시간 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {type === 'ATTACK' ? (
            <BattleIcon className={`w-5 h-5 ${typeStyle.icon}`} />
          ) : (
            <ShieldIcon className={`w-5 h-5 ${typeStyle.icon}`} />
          )}
          <span className={`font-semibold ${typeStyle.icon}`}>{typeStyle.label}</span>
          <span className="text-white font-medium">{author}</span>
          <span className={`px-2 py-1 rounded text-xs text-white ${teamStyle.badge}`}>{team}팀</span>
        </div>
        <span className="text-[#99A1AF] text-xs">{formatRelativeTime(timestamp)}</span>
      </div>

      {/* 연결된 이의제기 표시 (반론인 경우) */}
      {relatedAttack && (
        <div className="mb-3 pl-4 border-l-2 border-[#4CAF50] bg-[#1E3A1E]/30 py-2 px-3 rounded">
          <div className="flex items-center gap-2 mb-1">
            <BattleIcon className="w-4 h-4 text-[#4CAF50]" />
            <span className="text-[#4CAF50] text-xs font-semibold">이의제기</span>
            <span className="text-[#99A1AF] text-xs">by {relatedAttack.author}</span>
          </div>
          <p className="text-[#B0B0B0] text-xs line-clamp-2 break-words">{relatedAttack.content}</p>
        </div>
      )}

      {/* 내용 */}
      <p className="text-[#E0E0E0] text-sm mb-3 break-words">{content}</p>

      {/* 좋아요 */}
      <div className="flex items-center gap-1">
        <Like className="w-4 h-4 text-[#99A1AF]" />
        <span className="text-[#99A1AF] text-xs">{upvotes}</span>
      </div>
    </div>
  );
}
