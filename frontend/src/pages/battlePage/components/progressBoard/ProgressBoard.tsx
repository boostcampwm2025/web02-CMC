import { selectBattleProgress, selectProgressBoardCollapsed, useBattleStore } from '../../stores/battleStore';
import { CollapseButton } from './CollapseButton';
import { ExpandButton } from './ExpandButton';
import { ProgressBar } from './ProgressBar';
import { StageList } from './StageList';

export default function BattleProgressBoard() {
  const battleProgress = useBattleStore(selectBattleProgress);
  const collapsed = useBattleStore(selectProgressBoardCollapsed);
  const setCollapsed = useBattleStore((state) => state.setProgressBoardCollapsed);

  const shouldShow =
    battleProgress &&
    (battleProgress.phase as string) !== 'PENDING' &&
    battleProgress.expiredAt != null &&
    battleProgress.startedAt != null;
  console.log(battleProgress);
  return (
    <div className="fixed top-0 left-0 right-0 z-10 flex justify-center pointer-events-none">
      {shouldShow && (
        <div
          data-tutorial="progress-board"
          className={`
            pointer-events-auto relative w-full max-w-3xl rounded-lg bg-[#1a1a2ef2]
            border-b-[1.333px] border-b-[#1E2939]
            shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]
            transition-all duration-300 ease-in-out animate-slideDown
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
            <StageList
              round={battleProgress.round}
              phase={battleProgress.phase}
              phaseCount={battleProgress.phaseCount}
            />
            <ProgressBar expiredAt={battleProgress.expiredAt!} startedAt={battleProgress.startedAt!} />
          </div>
        </div>
      )}
    </div>
  );
}
