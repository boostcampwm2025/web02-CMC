import Icon from '@/commons/components/Icon';
import type { BattlePhaseName } from '@/commons/types/battle';
import { PHASE_CONFIG } from './phaseConfig';

interface RoundProgressCardProps {
  currentRound: number;
  totalRounds: number;
  topics: string[];
  currentPhase: BattlePhaseName | null;
  phaseCount: number | null;
}

export default function RoundProgressCard({
  currentRound,
  totalRounds,
  topics,
  currentPhase,
  phaseCount
}: RoundProgressCardProps) {
  const phaseConfig = currentPhase ? PHASE_CONFIG[currentPhase] : null;

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-lg battle-info-card-padding border border-blue-500/30 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
          <Icon name="target" className="battle-info-target-size text-white" />
        </div>
        <div className="flex-1">
          <p className="text-gray-400 text-xs mb-1 text-left">진행 단계</p>
          <p className="text-white battle-info-stat-value-size font-bold mb-1.5 text-left">
            라운드 {currentPhase === 'PENDING' ? 0 : currentRound} / {totalRounds}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {currentPhase !== 'PENDING' && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 text-orange-400 bg-orange-500/20 border-orange-500/50">
                  {topics[currentRound - 1]}
                </div>
              </div>
            )}
            {phaseConfig && (
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`px-3 py-1 ${phaseConfig.bgColor} border ${phaseConfig.borderColor} rounded-lg flex items-center gap-1.5`}
                >
                  <Icon name={phaseConfig.icon} className={`w-4 h-4 ${phaseConfig.color}`} />
                  <span className={`${phaseConfig.color} text-sm font-bold`}>
                    {phaseConfig.label}
                    {(currentPhase === 'ATTACK' || currentPhase === 'DEFENSE') && phaseCount && (
                      <span className="ml-1.5 text-xs opacity-80">{phaseCount === 1 ? '1차' : '2차'}</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full transition-all duration-500"
          style={{
            width: `${currentPhase === 'PENDING' ? 0 : (currentRound / totalRounds) * 100}%`
          }}
        />
      </div>
    </div>
  );
}
