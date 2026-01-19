import { useState } from 'react';
import { selectBattleProgress, useBattleStore } from '../../stores/battleStore';
import { CollapseButton } from './CollapseButton';
import { ExpandButton } from './ExpandButton';
import { ProgressBar } from './ProgressBar';
import { StageList } from './StageList';

export default function BattleProgressBoard() {
  const [collapsed, setCollapsed] = useState(false);
  const battleProgress = useBattleStore(selectBattleProgress);

  if (!battleProgress) return null;

  const { round, phase, phaseCount, expiredAt, startedAt } = battleProgress;

  if ((phase as string) === 'PENDING') {
    return null;
  }

  if (!expiredAt || !startedAt) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 flex justify-center pointer-events-none animate-slideDown">
      <div
        data-tutorial="progress-board"
        className={`
          pointer-events-auto relative max-w-3xl rounded-lg bg-[#1a1a2ef2]
          border-b-[1.333px] border-b-[#1E2939]
          shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]
          transition-all duration-300 ease-in-out
          ${collapsed ? '-translate-y-[7.5rem] h-8' : 'h-24 pb-3'}
        `}
      >
        {!collapsed && <CollapseButton onClick={() => setCollapsed(true)} />}
        {collapsed && <ExpandButton onClick={() => setCollapsed(false)} />}

        <div
          className={`
            absolute left-[1.638rem] top-3
            max-w-2xl
            flex flex-col gap-1.5
            transition-opacity duration-200
            ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
        >
          <StageList round={round} phase={phase} phaseCount={phaseCount} />
          <ProgressBar expiredAt={expiredAt} startedAt={startedAt} />
        </div>
      </div>
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
