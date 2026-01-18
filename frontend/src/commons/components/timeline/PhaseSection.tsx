import PhaseHeader from './PhaseHeader';
import MessageCard from './MessageCard';
import ArrowBadge from './ArrowBadge';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

interface PhaseSectionProps {
  teamAMessage: BattleDiscussion | BattleDefense | null;
  teamBMessage: BattleDiscussion | BattleDefense | null;
  formatTime: (timestamp?: number) => string;
  showBorder?: boolean;
}

export default function PhaseSection({
  teamAMessage,
  teamBMessage,
  formatTime,
  showBorder = false
}: PhaseSectionProps) {
  return (
    <div className={`relative ${showBorder ? 'border-t-2 border-[#2d2d3f]' : ''}`}>
      <PhaseHeader />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
        <div className="border-r border-[#2d2d3f] bg-gradient-to-r from-orange-500/5 to-transparent">
          <MessageCard message={teamAMessage} team="A" formatTime={formatTime} />
        </div>

        <ArrowBadge />
        <div className="bg-gradient-to-l from-blue-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]">
          <MessageCard message={teamBMessage} team="B" formatTime={formatTime} />
        </div>
      </div>
    </div>
  );
}
