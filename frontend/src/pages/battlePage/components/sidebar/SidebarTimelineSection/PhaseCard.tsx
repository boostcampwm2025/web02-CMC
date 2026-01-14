import { ArrowDown } from 'lucide-react';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';
import PhaseHeader from './PhaseHeader';
import MessageCard from './MessageCard';

interface PhaseCardProps {
  phase: 'attack-A' | 'attack-B';
  challengeMessage: BattleDiscussion | null;
  rebuttalMessage: BattleDefense | null;
}

type PhaseStyle = {
  challengeTeam: 'A' | 'B';
  rebuttalTeam: 'A' | 'B';
  arrow: string;
  challenge: string;
  rebuttal: string;
  hasBorderTop: boolean;
};

const PHASE_STYLES: Record<'attack-A' | 'attack-B', PhaseStyle> = {
  'attack-A': {
    challengeTeam: 'A',
    rebuttalTeam: 'B',
    arrow: 'text-orange-400',
    challenge: 'bg-gradient-to-r from-orange-500/5',
    rebuttal: 'bg-gradient-to-l from-blue-500/5',
    hasBorderTop: false
  },
  'attack-B': {
    challengeTeam: 'B',
    rebuttalTeam: 'A',
    arrow: 'text-red-400',
    challenge: 'bg-gradient-to-l from-red-500/5',
    rebuttal: 'bg-gradient-to-r from-blue-500/5',
    hasBorderTop: false
  }
};

export default function PhaseCard({ phase, challengeMessage, rebuttalMessage }: PhaseCardProps) {
  const { challengeTeam, rebuttalTeam, arrow, challenge, rebuttal, hasBorderTop } = PHASE_STYLES[phase];

  return (
    <div className={hasBorderTop ? 'border-t-2 border-[#2d2d3f]' : ''}>
      <PhaseHeader phase={phase} />
      <div className={`border-b border-[#2d2d3f] ${challenge} to-transparent`}>
        <MessageCard message={challengeMessage} team={challengeTeam} type="challenge" />
      </div>
      <div className="flex items-center justify-center py-1 bg-[#0a0a1a]">
        <ArrowDown className={`w-4 h-4 ${arrow}`} />
      </div>
      <div className={`${rebuttal} to-transparent`}>
        <MessageCard message={rebuttalMessage} team={rebuttalTeam} type="rebuttal" />
      </div>
    </div>
  );
}
