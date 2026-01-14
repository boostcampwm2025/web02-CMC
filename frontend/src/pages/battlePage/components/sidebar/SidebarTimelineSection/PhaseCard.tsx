import { ArrowDown, ArrowRight } from 'lucide-react';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';
import PhaseHeader from './PhaseHeader';
import MessageCard from './MessageCard';

interface PhaseCardProps {
  phase: 'attack-A' | 'attack-B';
  challengeMessage: BattleDiscussion | null;
  rebuttalMessage: BattleDefense | null;
  isWide?: boolean;
}

type PhaseStyle = {
  challengeTeam: 'A' | 'B';
  rebuttalTeam: 'A' | 'B';
  arrow: string;
  challenge: string;
  rebuttal: string;
};

const PHASE_STYLES: Record<'attack-A' | 'attack-B', PhaseStyle> = {
  'attack-A': {
    challengeTeam: 'A',
    rebuttalTeam: 'B',
    arrow: 'text-orange-400',
    challenge: 'bg-gradient-to-r from-orange-500/5',
    rebuttal: 'bg-gradient-to-l from-blue-500/5'
  },
  'attack-B': {
    challengeTeam: 'B',
    rebuttalTeam: 'A',
    arrow: 'text-red-400',
    challenge: 'bg-gradient-to-l from-red-500/5',
    rebuttal: 'bg-gradient-to-r from-blue-500/5'
  }
};

export default function PhaseCard({ phase, challengeMessage, rebuttalMessage, isWide = false }: PhaseCardProps) {
  const { challengeTeam, rebuttalTeam, arrow, challenge, rebuttal } = PHASE_STYLES[phase];

  return (
    <div>
      <PhaseHeader phase={phase} />
      <div className={`flex ${isWide ? 'flex-row' : 'flex-col'}`}>
        <div className={`flex-1 ${isWide ? 'border-r' : 'border-b'} border-[#2d2d3f] ${challenge} to-transparent`}>
          <MessageCard message={challengeMessage} team={challengeTeam} type="challenge" />
        </div>
        <div className={`flex items-center justify-center ${isWide ? 'px-2' : 'py-1'} bg-[#0a0a1a]`}>
          <ArrowDown className={`w-4 h-4 ${isWide ? 'hidden' : ''} ${arrow}`} />
          <ArrowRight className={`w-4 h-4 ${isWide ? '' : 'hidden'} ${arrow}`} />
        </div>
        <div className={`flex-1 ${rebuttal} to-transparent`}>
          <MessageCard message={rebuttalMessage} team={rebuttalTeam} type="rebuttal" />
        </div>
      </div>
    </div>
  );
}
