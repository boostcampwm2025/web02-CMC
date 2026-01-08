import BattleIcon from '@/assets/icon/battle.svg?react';
import { useBattleStore, selectBattleProgress } from '@/pages/battlePage/stores/battleStore';
import type { BattlePhase } from '@/commons/types/battle';

const PHASE_INFO: Record<BattlePhase, { category: string; message: string }> = {
  PENDING: {
    category: '대기 중',
    message: '참가자 입장을 기다리고 있습니다'
  },
  OPINION_SHARE: {
    category: '의견 공유',
    message: '자유롭게 의견을 나누실 수 있습니다'
  },
  ATTACK: {
    category: '공격 페이즈',
    message: '상대 코드를 분석하고 이의제기 하는 시간입니다.'
  },
  DEFENSE: {
    category: '반박 페이즈',
    message: '상대의 이의제기에 반박하는 시간입니다.'
  },
  TEAM_SWITCH: {
    category: '팀 전환',
    message: '팀 변경이 가능한 시간입니다.'
  }
};

export default function StageIndicator() {
  const battleProgress = useBattleStore(selectBattleProgress);

  const phase = (battleProgress?.phase as BattlePhase) || 'PENDING';
  const { category, message } = PHASE_INFO[phase] || PHASE_INFO.PENDING;

  return (
    <div className="flex items-center gap-6 min-w-[200px]">
      <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#FF6900] to-[#FB2C36] rounded-xl flex items-center justify-center">
        <BattleIcon className="w-[24px] h-[24px] text-white" />
      </div>
      <div className="text-left">
        <p className="text-[14px] text-[#99A1AF]">{category}</p>
        <p className="text-[20px] font-bold">{message}</p>
      </div>
    </div>
  );
}
