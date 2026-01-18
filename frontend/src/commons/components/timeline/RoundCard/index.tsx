import RoundHeader from './RoundHeader';
import PhaseSection from './PhaseSection';
import type { RoundData } from '@/commons/utils/organizeByRounds';

interface RoundCardProps {
  roundData: RoundData;
  isExpanded: boolean;
  onToggle: () => void;
  formatTime: (timestamp?: number) => string;
  showStatus?: boolean;
}

export default function RoundCard({ roundData, isExpanded, onToggle, formatTime, showStatus }: RoundCardProps) {
  const hasContent = !!(
    roundData.challenge.teamA ||
    roundData.challenge.teamB ||
    roundData.rebuttal.teamA ||
    roundData.rebuttal.teamB
  );

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
      <RoundHeader
        round={roundData.round}
        topic={roundData.topic}
        isActive={roundData.isActive}
        isFuture={roundData.isFuture}
        isExpanded={isExpanded}
        hasContent={hasContent}
        onToggle={onToggle}
        showStatus={showStatus}
      />

      {isExpanded && !roundData.isFuture && (
        <div className="border-t border-[#2d2d3f]">
          {/* A팀 공격 → B팀 수비 */}
          <PhaseSection
            attackMessage={roundData.challenge.teamA}
            defenseMessage={roundData.rebuttal.teamB}
            attackingTeam="A"
            formatTime={formatTime}
          />

          {/* B팀 공격 → A팀 수비 */}
          <PhaseSection
            attackMessage={roundData.challenge.teamB}
            defenseMessage={roundData.rebuttal.teamA}
            attackingTeam="B"
            formatTime={formatTime}
            showBorder={true}
          />
        </div>
      )}
    </div>
  );
}
