import PhaseHeader from './PhaseHeader';
import MessageCard from './MessageCard';
import ArrowBadge from './ArrowBadge';
import type { TimelineItem } from '@cmc/types';

interface PhaseSectionProps {
  attackMessage: TimelineItem | null;
  defenseMessage: TimelineItem | null;
  attackingTeam: 'A' | 'B';
  formatTime: (timestamp?: number) => string;
  showBorder?: boolean;
}

export default function PhaseSection({
  attackMessage,
  defenseMessage,
  attackingTeam,
  formatTime,
  showBorder = false
}: PhaseSectionProps) {
  // attackingTeam이 'A'면 왼쪽에 A팀 공격, 오른쪽에 B팀 수비
  // attackingTeam이 'B'면 왼쪽에 B팀 공격, 오른쪽에 A팀 수비
  const leftMessage = attackingTeam === 'A' ? attackMessage : attackMessage;
  const rightMessage = attackingTeam === 'A' ? defenseMessage : defenseMessage;

  return (
    <div className={`relative ${showBorder ? 'border-t-2 border-[#2d2d3f]' : ''}`}>
      <PhaseHeader />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
        <div className="border-r border-[#2d2d3f] bg-gradient-to-r from-orange-500/5 to-transparent">
          <MessageCard message={leftMessage} team={leftMessage?.team || 'A'} formatTime={formatTime} />
        </div>

        <ArrowBadge />
        <div className="bg-gradient-to-l from-blue-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]">
          <MessageCard message={rightMessage} team={rightMessage?.team || 'B'} formatTime={formatTime} />
        </div>
      </div>
    </div>
  );
}
