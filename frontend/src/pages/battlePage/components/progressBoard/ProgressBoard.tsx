import { useState, useMemo } from 'react';
import { StageIcon } from './StageIcon';
import DownArrowIcon from '@/assets/icon/downArrow.svg?react';
import { selectBattleProgress, useBattleStore } from '../../stores/battleStore';
import type { BattlePhase } from '@/commons/types/battle';

const COLOR_MAP = {
  BASE: { bg: '#0A0A1A', border: '#364153', text: '#99A1AF' },
  OPINION_SHARE: { bg: '#de932333', border: '#ffa200ff', text: '#ffa200ff' },
  ATTACK: { bg: '#f7414133', border: '#e33f12ff', text: '#de1f1fff' },
  DEFENSE: { bg: '#2b7fff33', border: '#2B7FFF', text: '#2B7FFF' },
  TEAM_SWITCH: { bg: '#bd5efc33', border: '#9500ffff', text: '#b300ffff' },
  PENDING: { bg: '#0A0A1A', border: '#364153', text: '#99A1AF' }
};

// 6단계 정의 (한 라운드당 6개 페이즈)
const STAGES = [
  { step: 1, phase: 'OPINION_SHARE', icon: 'message', label: '의견공유' },
  { step: 2, phase: 'ATTACK', icon: 'battle', label: '공격(1차)' },
  { step: 3, phase: 'DEFENSE', icon: 'shield', label: '수비(1차)' },
  { step: 4, phase: 'ATTACK', icon: 'battle', label: '공격(2차)' },
  { step: 5, phase: 'DEFENSE', icon: 'shield', label: '수비(2차)' },
  { step: 6, phase: 'TEAM_SWITCH', icon: 'switch', label: '팀변경' }
] as const;

interface BattleProgressBoardProps {
  raiseZIndex?: boolean;
}

export default function BattleProgressBoard({ raiseZIndex = false }: BattleProgressBoardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const battleProgress = useBattleStore(selectBattleProgress);

  // 프로그레스 바 duration 계산
  const duration = useMemo(() => {
    if (!battleProgress?.expiredAt || !battleProgress?.startedAt) return 60;
    return Math.max(0, (battleProgress.expiredAt - battleProgress.startedAt) / 1000);
  }, [battleProgress?.expiredAt, battleProgress?.startedAt]);

  if (!battleProgress) return null;

  const { round, phase, phaseCount } = battleProgress;

  // 현재 페이즈의 step 번호 계산 (1-6)
  const getCurrentPhaseStep = () => {
    // phaseCount는 ATTACK/DEFENSE 반복 횟수 (1~BATTLE_MAX_PHASE_COUNT)
    // phase와 phaseCount로 step 계산
    if (phase === 'OPINION_SHARE') return 1;
    if (phase === 'ATTACK') return phaseCount * 2; // 1차: 2, 2차: 4
    if (phase === 'DEFENSE') return phaseCount * 2 + 1; // 1차: 3, 2차: 5
    if (phase === 'TEAM_SWITCH') return 6;
    return 1;
  };

  // 현재 활성 단계인지 확인
  const isActiveStage = (stageStep: number) => {
    return getCurrentPhaseStep() === stageStep;
  };

  // 현재 라운드-페이즈 번호 계산
  const getCurrentStageNumber = () => {
    if (phase === 'PENDING') return '대기중';
    return `${round} - ${getCurrentPhaseStep()}`;
  };

  const getStageColor = (stage: BattlePhase) => COLOR_MAP[stage] || COLOR_MAP.BASE;

  return (
    <div
      className="
        sticky top-0 z-10
        flex justify-center
        pointer-events-none
        ${raiseZIndex ? 'z-[110]' : 'z-0'}
      `}
    >
      <div
        data-tutorial="progress-board"
        className={`
          pointer-events-auto
          relative
          w-[750px]
          rounded-lg
          bg-[#1a1a2ef2]
          border-b-[1.333px] border-b-[#1E2939]
          shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]
          transition-all duration-300 ease-in-out
          ${collapsed ? '-translate-y-[120px] h-[32px]' : 'h-[100px] pb-3'}
        `}
      >
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="
              absolute right-[3px] top-[12px]
              w-[32px] h-[32px]
              rounded-full
              bg-[#FF6900]
              shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]
              flex items-center justify-center

              transition-all duration-200 ease-out
              hover:scale-110
              hover:bg-[#FF5200]
              active:scale-95
            "
          >
            <div
              className="
                w-[10px] h-[10px]
                border-r-2 border-b-2 border-white
                -rotate-135
              "
            />
          </button>
        )}

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="
              absolute left-1/2 -translate-x-1/2 top-[calc(100%+96px)]
              w-[32px] h-[32px]
              rounded-full
              bg-[#FF6900]
              shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]
              flex items-center justify-center
              transition-all duration-200 ease-out
              hover:scale-110
              hover:bg-[#FF5200]
              active:scale-95

            "
          >
            <div
              className="
                w-[10px] h-[10px]
                border-r-2 border-b-2 border-white
                rotate-45
              "
            />
          </button>
        )}

        <div
          className={`
            absolute left-[26.21px] top-[12px]
            w-[700px]
            flex flex-col gap-1.5
            transition-opacity duration-200
            ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
        >
          <div className="flex items-center gap-4 px-4">
            <div className="text-[32px] font-bold text-[#FF6900] min-w-[100px] flex items-center justify-center h-[56px]">
              {getCurrentStageNumber()}
            </div>
            {STAGES.map((stage, index) => (
              <div key={stage.step} className="flex items-center gap-3">
                <StageIcon
                  icon={stage.icon as 'message' | 'battle' | 'shield' | 'switch'}
                  {...getStageColor(stage.phase as BattlePhase)}
                  active={isActiveStage(stage.step)}
                  small={true}
                />
                {index < STAGES.length - 1 && <DownArrowIcon className="-rotate-90 opacity-40" />}
              </div>
            ))}
          </div>

          <div className="mt-1.5 h-[6px] bg-[#0A0A1A] rounded-full overflow-hidden">
            <div
              key={`${battleProgress?.expiredAt}-${battleProgress?.startedAt}`}
              className="h-full bg-gradient-to-r from-[#FF6900] via-[#FF8904] to-[#F54900]"
              style={{
                animation: `shrink ${duration}s linear`,
                animationFillMode: 'forwards'
              }}
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
