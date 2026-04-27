import { getTimeAgo } from '@/commons/utils/getTimeAgo';
import type { TimelineMessageProps } from './types';

export default function TimelineMessage({ message, team, type }: TimelineMessageProps) {
  if (!message) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600 text-sm">{type === 'challenge' ? '이의제기 대기 중...' : '반론 대기 중...'}</div>
      </div>
    );
  }

  const isTeamA = team === 'A';

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${
              isTeamA ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {isTeamA ? 'A팀' : 'B팀'}
          </span>
          <span className="text-white font-medium text-xs">{message.author?.nickname ?? 'SYSTEM'}</span>
        </div>
        <span className="text-gray-500 text-xs">
          {message.selectedAt ? getTimeAgo(new Date(message.selectedAt).toISOString()) : '알 수 없음'}
        </span>
      </div>

      <p className="text-gray-300 leading-relaxed text-sm break-words">{message.content}</p>
    </div>
  );
}
