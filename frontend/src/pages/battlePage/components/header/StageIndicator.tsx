import Icon, { type IconName } from '@/commons/components/Icon';
import { useBattleStore, selectBattleProgress } from '@/pages/battlePage/stores/battleStore';
import type { BattleInfo, BattlePhase } from '@/commons/types/battle';
import { useLoaderData } from 'react-router-dom';

interface PhaseStyle {
  category: string;
  message: string;
  container: string;
  icon: string;
  iconName: IconName;
}

const PHASE_CONFIG: Record<BattlePhase, PhaseStyle> = {
  PENDING: {
    category: '대기 중',
    message: '배틀이 시작되기를 기다리고 있습니다.',
    container: 'bg-[#2B3440] border-[#9CA3AF]',
    icon: 'text-[#E5E7EB] w-7 h-7',
    iconName: 'timer'
  },
  OPINION_SHARE: {
    category: '의견 공유',
    message: '자유롭게 의견을 공유합니다.',
    container: 'bg-[#2E1F0A] border-[#FFA200]',
    icon: 'text-[#FFA200] w-6 h-6',
    iconName: 'message'
  },
  ATTACK: {
    category: '이의제기',
    message: '양 진영이 서로의 코드에 대해 공격합니다.',
    container: 'bg-[#3B1414] border-[#E33F12]',
    icon: 'text-[#FF3B30] w-6 h-6',
    iconName: 'battle'
  },
  DEFENSE: {
    category: '반박',
    message: '상대방의 공격을 방어합니다.',
    container: 'bg-[#0F2A4D] border-[#2B7FFF]',
    icon: 'text-[#4F8CFF] w-7 h-7',
    iconName: 'shield'
  },
  TEAM_SWITCH: {
    category: '팀 전환',
    message: '자신의 진영을 변경합니다.',
    container: 'bg-[#2B0F3F] border-[#B300FF]',
    icon: 'text-[#C84DFF] w-7 h-7',
    iconName: 'switch'
  }
};

export default function StageIndicator() {
  const battleProgress = useBattleStore(selectBattleProgress);
  const battleInfo = useLoaderData<BattleInfo>();
  if (!battleProgress) return;

  const topics = battleInfo?.topics || [];
  const { round, phaseCount } = battleProgress;
  const phase = (battleProgress?.phase as BattlePhase) || 'PENDING';
  const { iconName, category, message, container, icon } = PHASE_CONFIG[phase] || PHASE_CONFIG.PENDING;
  const phaseName = ['ATTACK', 'DEFENSE'].includes(phase) ? `${phaseCount}차 ${category}` : category;

  return (
    <div className="flex items-center gap-6 min-w-[12.5rem]">
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${container}`}
      >
        <Icon name={iconName} className={icon} />
      </div>

      <div className="text-left">
        <div className="flex items-center gap-2">
          {/* Round */}
          <span className="px-3 py-1 rounded-lg bg-[#253041] text-[#B6BDC9] text-sm font-semibold">{round} Round</span>

          {/* Topic */}
          {topics.length > 0 && (
            <span className="px-3 py-1 rounded-lg bg-[#1E293B] text-[#C7D2FE] text-sm font-semibold">
              {topics[round - 1]}
            </span>
          )}

          {/* Phase (메인) */}
          <span className="px-3 py-1 rounded-lg bg-[#0B1220] text-[#F9FAFB] text-sm font-semibold border border-[#2B7FFF]/30">
            {phaseName}
          </span>
        </div>

        <p className="text-xl font-bold text-white leading-tight mt-0.5">{message}</p>
      </div>
    </div>
  );
}
