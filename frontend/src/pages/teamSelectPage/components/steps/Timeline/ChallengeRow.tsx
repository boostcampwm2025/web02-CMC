import Icon from '@/commons/components/Icon';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';
import MessageCard from './MessageCard';

interface ChallengeRowProps {
  attackTeam: 'A' | 'B';
  phase: 1 | 2;
  challengeMessage: BattleDiscussion | null;
  rebuttalMessage: BattleDefense | null;
  isFirst?: boolean;
}

const TEAM_STYLE = {
  A: {
    header: 'from-orange-900/20 to-blue-900/20',
    zapColor: 'text-orange-400',
    leftBg: 'from-orange-500/5',
    glowColor: 'bg-orange-500/20',
    arrowBg: 'from-orange-500 to-blue-600',
    arrowBorder: 'border-orange-400/50'
  },
  B: {
    header: 'from-red-900/20 to-blue-900/20',
    zapColor: 'text-red-400',
    leftBg: 'from-red-500/5',
    glowColor: 'bg-red-500/20',
    arrowBg: 'from-red-500 to-blue-600',
    arrowBorder: 'border-red-400/50'
  }
} as const;

export default function ChallengeRow({
  attackTeam,
  phase,
  challengeMessage,
  rebuttalMessage,
  isFirst = false
}: ChallengeRowProps) {
  const defenseTeam = attackTeam === 'A' ? 'B' : 'A';
  const style = TEAM_STYLE[attackTeam];

  return (
    <div className={`relative ${!isFirst ? 'border-t-2 border-[#2d2d3f]' : ''}`}>
      <div className={`px-6 py-3 bg-gradient-to-r ${style.header} border-b border-[#2d2d3f]`}>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Icon name="zap" className={`w-4 h-4 ${style.zapColor}`} />
            <span className={`${style.zapColor} font-bold text-xs uppercase tracking-wider`}>
              {attackTeam} 이의제기 ({phase}차)
            </span>
          </div>
          <Icon name="arrowRight" className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <Icon name="shield" className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">{defenseTeam} 반론</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
        <div className={`border-r border-[#2d2d3f] bg-gradient-to-r ${style.leftBg} to-transparent`}>
          <MessageCard message={challengeMessage} team={attackTeam} type="challenge" />
        </div>
        <div className="hidden md:flex items-center justify-center px-4 bg-[#0a0a1a] border-r border-[#2d2d3f]">
          <div className="relative">
            <div className={`absolute inset-0 ${style.glowColor} blur-lg rounded-full`} />
            <div
              className={`relative bg-gradient-to-r ${style.arrowBg} w-12 h-12 rounded-full flex items-center justify-center border-2 ${style.arrowBorder} shadow-lg`}
            >
              <Icon name="arrowRight" className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-l from-blue-500/5 to-transparent border-t md:border-t-0 border-[#2d2d3f]">
          <MessageCard message={rebuttalMessage} team={defenseTeam} type="rebuttal" />
        </div>
      </div>
    </div>
  );
}
