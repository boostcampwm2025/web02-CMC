import { useState } from 'react';
import { CollapseButton } from '../progressBoard/CollapseButton';
import { ExpandButton } from '../progressBoard/ExpandButton';
import { StageList } from '../progressBoard/StageList';
import { ProgressBar } from '../progressBoard/ProgressBar';

const MOCK_ROUND = 1;
const MOCK_PHASE = 'ATTACK';
const MOCK_PHASE_COUNT = 1;
const MOCK_STARTED_AT = Date.now();
const MOCK_EXPIRED_AT = Date.now() + 5 * 60 * 1000;

export default function TutorialProgressBoard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
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
        <StageList round={MOCK_ROUND} phase={MOCK_PHASE as any} phaseCount={MOCK_PHASE_COUNT} />
        <ProgressBar expiredAt={MOCK_EXPIRED_AT} startedAt={MOCK_STARTED_AT} />
      </div>
    </div>
  );
}
