import { ThumbsUp } from 'lucide-react';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

interface MessageCardProps {
  message: BattleDiscussion | BattleDefense | null;
  team: 'A' | 'B';
  type: 'challenge' | 'rebuttal';
  formatTime: (timestamp?: number) => string;
}

export default function MessageCard({ message, team, type, formatTime }: MessageCardProps) {
  if (!message) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600 text-sm">{type === 'challenge' ? '이의제기 대기 중...' : '반론 대기 중...'}</div>
      </div>
    );
  }

  const isTeamA = team === 'A';

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${
              isTeamA ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {isTeamA ? 'A팀' : 'B팀'}
          </span>
          <span className="text-white font-medium text-sm">
            {message.authorId ? `User-${message.authorId.slice(0, 6)}` : '익명'}
          </span>
        </div>
        <span className="text-gray-500 text-xs">{formatTime(message.selectedAt)}</span>
      </div>

      {/* 내용 */}
      <p className="text-gray-300 mb-4 leading-relaxed text-sm">{message.content}</p>

      {/* 투표 표시 */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 w-fit ${
          isTeamA ? 'bg-blue-600/20 border-blue-500/30' : 'bg-red-600/20 border-red-500/30'
        }`}
      >
        <ThumbsUp className={`w-4 h-4 ${isTeamA ? 'text-blue-400' : 'text-red-400'}`} />
        <span className={`font-bold ${isTeamA ? 'text-blue-300' : 'text-red-300'}`}>{message.upvotes}</span>
      </div>
    </div>
  );
}
