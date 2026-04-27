import Icon from '@/commons/components/Icon';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';
import { getTimeAgo } from '@/commons/utils/getTimeAgo';

interface MessageCardProps {
  message: BattleDiscussion | BattleDefense | null;
  team: 'A' | 'B';
  type: 'challenge' | 'rebuttal';
}

export default function MessageCard({ message, team, type }: MessageCardProps) {
  if (!message) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600 text-sm">{type === 'challenge' ? '이의제기 대기 중...' : '반론 대기 중...'}</div>
      </div>
    );
  }

  const isTeamA = team === 'A';

  return (
    <div className="p-6 w-full flex flex-col h-48 overflow-hidden justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${
              isTeamA ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {isTeamA ? 'A팀' : 'B팀'}
          </span>
          <span className="text-white font-medium text-sm">{message.author?.nickname ?? 'SYSTEM'}</span>
        </div>
        <span className="text-gray-500 text-xs">
          {message.selectedAt ? getTimeAgo(new Date(message.selectedAt).toISOString()) : '알 수 없음'}
        </span>
      </div>

      <p className="text-gray-300 mb-4 leading-relaxed text-xs break-all text-left">{message.content}</p>

      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 w-fit ${
          isTeamA ? 'bg-blue-600/20 border-blue-500/30' : 'bg-red-600/20 border-red-500/30'
        }`}
      >
        <Icon name="like" className={`w-4 h-4 ${isTeamA ? 'text-blue-400' : 'text-red-400'}`} />
        <span className={`font-bold ${isTeamA ? 'text-blue-300' : 'text-red-300'}`}>{message.upvotes}</span>
      </div>
    </div>
  );
}
