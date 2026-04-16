import Icon from '@/commons/components/Icon';
import TimelineMessage from './TimelineMessage';
import type { PhaseFlowCardProps } from './types';

export default function PhaseFlowCard({ attackTeam, defenseTeam, attackMessage, defenseMessage }: PhaseFlowCardProps) {
  const isAttackTeamA = attackTeam === 'A';

  const headerGradient = isAttackTeamA ? 'from-orange-900/20 to-blue-900/20' : 'from-red-900/20 to-blue-900/20';

  const attackIconColor = isAttackTeamA ? 'text-orange-400' : 'text-red-400';
  const defenseIconColor = 'text-blue-400';

  const attackTextColor = isAttackTeamA ? 'text-orange-400' : 'text-red-400';
  const defenseTextColor = 'text-blue-400';

  const attackBgGradient = isAttackTeamA ? 'from-orange-500/5 to-transparent' : 'from-red-500/5 to-transparent';
  const defenseBgGradient = 'from-blue-500/5 to-transparent';

  return (
    <div className="relative bg-[#1a1a2e] rounded-xl border-2 border-[#2d2d3f] overflow-hidden mb-4">
      <div className={`px-4 py-2 bg-gradient-to-r ${headerGradient} border-b border-[#2d2d3f]`}>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Icon name="zap" className={`w-4 h-4 ${attackIconColor}`} />
            <span className={`${attackTextColor} font-bold text-xs uppercase tracking-wider`}>
              {attackTeam} 이의제기
            </span>
          </div>

          <Icon name="arrowRight" className="w-4 h-4 text-gray-500" />

          <div className="flex items-center gap-2">
            <Icon name="shield" className={`w-4 h-4 ${defenseIconColor}`} />
            <span className={`${defenseTextColor} font-bold text-xs uppercase tracking-wider`}>{defenseTeam} 반론</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className={`border-b md:border-b-0 md:border-r border-[#2d2d3f] bg-gradient-to-r ${attackBgGradient}`}>
          <TimelineMessage message={attackMessage} team={attackTeam} type="challenge" />
        </div>

        <div className={`bg-gradient-to-l ${defenseBgGradient}`}>
          <TimelineMessage message={defenseMessage} team={defenseTeam} type="rebuttal" />
        </div>
      </div>
    </div>
  );
}
