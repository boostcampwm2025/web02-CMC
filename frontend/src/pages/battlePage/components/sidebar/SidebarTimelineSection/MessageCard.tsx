import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

interface MessageCardProps {
  message: BattleDiscussion | BattleDefense | null;
  team: 'A' | 'B';
  type: 'challenge' | 'rebuttal';
}

export default function MessageCard({ message, team, type }: MessageCardProps) {
  const isTeamA = team === 'A';

  if (!message) {
    return (
      <div className="p-3 min-h-[72px] flex items-center justify-center">
        <div className="text-gray-600 text-xs">{type === 'challenge' ? '이의제기 대기 중' : '반론 대기 중'}</div>
      </div>
    );
  }

  return (
    <div className="p-3 min-h-[72px] animate-message-appear">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isTeamA ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}
          >
            {isTeamA ? 'A팀' : 'B팀'}
          </span>
          <span className="text-white font-medium text-[11px]">{message.authorId ? message.authorId : '익명'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-[10px]">{message.upvotes}명 지지</span>
        </div>
      </div>
      <p className="text-gray-300 mb-2 leading-relaxed text-[11px]">{message.content}</p>
    </div>
  );
}
