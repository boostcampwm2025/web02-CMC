import { formatTime } from './utils/formatTime';
import type { TimelineMessageProps } from './types';

/**
 * 단일 타임라인 메시지 컴포넌트
 *
 * @description
 * 공격(이의제기) 또는 수비(반론) 메시지를 카드 형태로 표시합니다.
 * 메시지가 없는 경우 "대기 중..." 상태를 표시합니다.
 */
export default function TimelineMessage({ message, team, type }: TimelineMessageProps) {
  // 메시지가 없는 경우 대기 중 상태 표시
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
      {/* 헤더: 작성자 정보 및 시간 */}
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
        <span className="text-gray-500 text-xs">{formatTime(message.selectedAt)}</span>
      </div>

      {/* 메시지 내용 */}
      <p className="text-gray-300 leading-relaxed text-sm">{message.content}</p>
    </div>
  );
}
