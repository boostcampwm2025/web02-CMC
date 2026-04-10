import { useState } from 'react';
import Icon from '@/commons/components/Icon';
import type { RoundData } from '@/pages/teamSelectPage/utils/organizeByRounds';
import ChallengeRow from './ChallengeRow';

interface RoundItemProps {
  roundData: RoundData;
  defaultExpanded?: boolean;
}

type RoundStatus = 'active' | 'future' | 'completed';

function getRoundStatus({ isActive, isFuture }: Pick<RoundData, 'isActive' | 'isFuture'>): RoundStatus {
  if (isActive) return 'active';
  if (isFuture) return 'future';
  return 'completed';
}

const ROUND_WRAPPER_STYLE: Record<RoundStatus, string> = {
  active: 'border-orange-500/50 shadow-lg shadow-orange-500/20',
  future: 'border-gray-700/30 opacity-50',
  completed: 'border-[#2d2d3f]'
};

const ROUND_BADGE_STYLE: Record<RoundStatus, string> = {
  active: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30',
  future: 'bg-gray-700/30 text-gray-600',
  completed: 'bg-gray-700/50 text-gray-400'
};

const TOPIC_BADGE_STYLE: Record<RoundStatus, string> = {
  active: 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md shadow-purple-400/20',
  future: 'bg-gray-700/20 text-gray-500',
  completed: 'bg-gray-700/40 text-gray-400'
};

export default function RoundItem({ roundData, defaultExpanded = false }: RoundItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasContent = roundData.challenges.some((c) => c.challengeMessage || c.rebuttalMessage);
  const status = getRoundStatus(roundData);

  return (
    <div className={`bg-[#1a1a2e] rounded-xl border-2 overflow-hidden transition-all ${ROUND_WRAPPER_STYLE[status]}`}>
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        disabled={roundData.isFuture}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#16162a] to-[#1a1a2e] hover:from-[#1a1a2e] hover:to-[#1e1e2f] transition-all disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg font-bold ${ROUND_BADGE_STYLE[status]}`}>Round {roundData.round}</div>
          <div
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${TOPIC_BADGE_STYLE[status]}`}
          >
            {roundData.topic}
          </div>

          {status === 'active' && (
            <div className="flex items-center gap-2 text-orange-400">
              <Icon name="flame" className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-bold">진행 중</span>
            </div>
          )}
          {status === 'completed' && hasContent && <div className="text-sm text-gray-500">완료</div>}
          {status === 'future' && <div className="text-sm text-gray-600">대기 중</div>}
        </div>

        {status !== 'future' && (
          <div className="text-gray-400">
            {isExpanded ? (
              <Icon name="chevronUp" className="w-5 h-5" />
            ) : (
              <Icon name="chevronDown" className="w-5 h-5" />
            )}
          </div>
        )}
      </button>

      {isExpanded && status !== 'future' && (
        <div className="border-t border-[#2d2d3f]">
          {roundData.challenges.map((challenge, i) => (
            <ChallengeRow key={i} {...challenge} isFirst={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
