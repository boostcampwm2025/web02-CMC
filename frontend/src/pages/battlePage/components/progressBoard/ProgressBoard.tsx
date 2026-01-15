import { useState } from 'react';
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

interface BattleProgressBoardProps {
  raiseZIndex?: boolean;
}

export default function BattleProgressBoard({ raiseZIndex = false }: BattleProgressBoardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const battleProgress = useBattleStore(selectBattleProgress);
  if (!battleProgress) return null;

  const { round, phase } = battleProgress;

  const isActive = (stage: BattlePhase) => phase === stage;

  const getStageColor = (stage: BattlePhase) => (isActive(stage) ? COLOR_MAP[stage] : COLOR_MAP.BASE);

  return (
    <div
      className={`
        sticky top-0
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
          w-[400px]
          rounded-lg
          bg-[#1a1a2ef2]
          border-b-[1.333px] border-b-[#1E2939]
          shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]
          transition-all duration-300 ease-in-out
          ${collapsed ? '-translate-y-[120px] h-[32px]' : 'h-[143.33px]'}
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
            absolute left-[26.21px] top-[16px]
            w-[347.58px]
            flex flex-col gap-2
            transition-opacity duration-200
            ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
        >
          <div
            className="absolute left-[6px] top-[-4px] h-[4px] w-[336px]
              bg-gradient-to-r from-[#FF6900] via-[#FF8904] to-[#F54900]"
          />

          <div className="text-center text-[12px] tracking-[0.6px] uppercase text-[#FF6900]">배틀 진행 상황</div>

          <div className="flex items-center gap-4">
            <StageIcon
              label="의견 공유"
              icon="message"
              {...getStageColor('OPINION_SHARE')}
              active={isActive('OPINION_SHARE')}
            />

            <DownArrowIcon className="-rotate-90 opacity-40 -translate-y-2" />

            <StageIcon label="이의제기" icon="battle" small {...getStageColor('ATTACK')} active={isActive('ATTACK')} />

            <DownArrowIcon className="-rotate-90 opacity-40 -translate-y-2" />

            <StageIcon label="반박" icon="shield" small {...getStageColor('DEFENSE')} active={isActive('DEFENSE')} />

            <DownArrowIcon className="-rotate-90 opacity-40 -translate-y-2" />

            <StageIcon
              label="팀 변경"
              icon="switch"
              small
              {...getStageColor('TEAM_SWITCH')}
              active={isActive('TEAM_SWITCH')}
            />
          </div>

          <div className="relative mt-1 h-[15px]">
            <div className="text-center text-[10px] font-bold text-[#6A7282]">Round {round}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
