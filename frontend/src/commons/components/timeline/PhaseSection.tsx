import PhaseHeader from './PhaseHeader';
import MessageCard from './MessageCard';
import ArrowBadge from './ArrowBadge';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

interface PhaseSectionProps {
  type: 'challenge' | 'rebuttal';
  teamAMessage: BattleDiscussion | BattleDefense | null;
  teamBMessage: BattleDiscussion | BattleDefense | null;
  formatTime: (timestamp?: number) => string;
}

export default function PhaseSection({ type, teamAMessage, teamBMessage, formatTime }: PhaseSectionProps) {
  const isChallenge = type === 'challenge';
  const teamAColor = isChallenge ? 'orange' : 'blue';
  const teamBColor = isChallenge ? 'blue' : 'red';

  return (
    <div className={`relative ${!isChallenge ? 'border-t-2 border-[#2d2d3f]' : ''}`}>
      <PhaseHeader type={type} />

      {/* VS 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
        {/* A팀 메시지 */}
        <div className={`border-r border-[#2d2d3f] bg-gradient-to-r from-${teamAColor}-500/5 to-transparent`}>
          <MessageCard message={teamAMessage} team="A" type={type} formatTime={formatTime} />
        </div>

        {/* 화살표 배지 */}
        <ArrowBadge type={type} />

        {/* B팀 메시지 */}
        <div
          className={`bg-gradient-to-l from-${teamBColor}-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]`}
        >
          <MessageCard message={teamBMessage} team="B" type={type} formatTime={formatTime} />
        </div>
      </div>
    </div>
  );
}
