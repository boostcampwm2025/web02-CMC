import { useState } from 'react';
import Icon from '@/commons/components/Icon';
import type { RoundData } from '@/pages/teamSelectPage/utils/organizeByRounds';
import ChallengeRow from './ChallengeRow';

interface RoundItemProps {
  roundData: RoundData;
  defaultExpanded?: boolean;
}

export default function RoundItem({ roundData, defaultExpanded = false }: RoundItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasContent =
    roundData.challenge1.teamA ||
    roundData.challenge1.teamB ||
    roundData.challenge2.teamA ||
    roundData.challenge2.teamB ||
    roundData.challenge3.teamA ||
    roundData.challenge3.teamB ||
    roundData.challenge4.teamA ||
    roundData.challenge4.teamB;

  return (
    <div
      className={`bg-[#1a1a2e] rounded-xl border-2 overflow-hidden transition-all ${
        roundData.isActive
          ? 'border-orange-500/50 shadow-lg shadow-orange-500/20'
          : roundData.isFuture
            ? 'border-gray-700/30 opacity-50'
            : 'border-[#2d2d3f]'
      }`}
    >
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        disabled={roundData.isFuture}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#16162a] to-[#1a1a2e] hover:from-[#1a1a2e] hover:to-[#1e1e2f] transition-all disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-lg font-bold ${
              roundData.isActive
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                : roundData.isFuture
                  ? 'bg-gray-700/30 text-gray-600'
                  : 'bg-gray-700/50 text-gray-400'
            }`}
          >
            Round {roundData.round}
          </div>
          <div
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              roundData.isActive
                ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md shadow-purple-400/20'
                : roundData.isFuture
                  ? 'bg-gray-700/20 text-gray-500'
                  : 'bg-gray-700/40 text-gray-400'
            }`}
          >
            {roundData.topic}
          </div>

          {roundData.isActive && (
            <div className="flex items-center gap-2 text-orange-400">
              <Icon name="flame" className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-bold">진행 중</span>
            </div>
          )}
          {!roundData.isFuture && !roundData.isActive && hasContent && (
            <div className="text-sm text-gray-500">완료</div>
          )}
          {roundData.isFuture && <div className="text-sm text-gray-600">대기 중</div>}
        </div>

        {!roundData.isFuture && (
          <div className="text-gray-400">
            {isExpanded ? (
              <Icon name="chevronUp" className="w-5 h-5" />
            ) : (
              <Icon name="chevronDown" className="w-5 h-5" />
            )}
          </div>
        )}
      </button>

      {isExpanded && !roundData.isFuture && (
        <div className="border-t border-[#2d2d3f]">
          <ChallengeRow
            attackTeam="A"
            phase={1}
            challengeMessage={roundData.challenge1.teamA}
            rebuttalMessage={roundData.challenge1.teamB}
            isFirst
          />
          <ChallengeRow
            attackTeam="B"
            phase={1}
            challengeMessage={roundData.challenge2.teamB}
            rebuttalMessage={roundData.challenge2.teamA}
          />
          <ChallengeRow
            attackTeam="A"
            phase={2}
            challengeMessage={roundData.challenge3.teamA}
            rebuttalMessage={roundData.challenge3.teamB}
          />
          <ChallengeRow
            attackTeam="B"
            phase={2}
            challengeMessage={roundData.challenge4.teamB}
            rebuttalMessage={roundData.challenge4.teamA}
          />
        </div>
      )}
    </div>
  );
}
