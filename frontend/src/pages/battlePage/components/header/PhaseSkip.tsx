import SkipIcon from '@/assets/icon/skip.svg?react';
import { usePhaseSkip } from '../../hooks/usePhaseSkip';
import type { BattlePhase } from '@/commons/types/battle';

interface PhaseSkipProps {
  phase: BattlePhase;
}

export default function PhaseSkip({ phase }: PhaseSkipProps) {
  const { isSkipEnabled, totalSkips, toggleSkip } = usePhaseSkip();

  const isSkip = ['PENDING', 'TEAM_SWITCH'].includes(phase);

  return (
    <div className="ml-auto">
      <div className="mb-3 bg-[#0a0a1a]/40 border border-gray-700 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 relative group">
          <span className="text-white text-sm font-semibold whitespace-nowrap">이번 페이즈 스킵</span>
          <SkipIcon className="w-4 h-4 text-cyan-400" />

          <button
            type="button"
            onClick={toggleSkip}
            disabled={isSkip}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
              ${isSkipEnabled ? 'bg-blue-500' : 'bg-[#3A3A4F]'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${isSkipEnabled ? 'translate-x-4' : 'translate-x-1'}`}
            />
          </button>
          <div
            className="
              pointer-events-none
              absolute bottom-full left-1/2 mb-5 -translate-x-1/2
              px-3 py-2
              bg-[#1E1E2F] text-white text-sm
              rounded-lg
              border border-[#364153]
              opacity-0 translate-y-1
              transition-all duration-200
              whitespace-nowrap z-20
              group-hover:opacity-100 group-hover:translate-y-0
            "
          >
            모든 인원이 스킵에 동의하면 페이즈가 넘어갑니다.
          </div>
        </div>
      </div>

      <span className="text-xs text-gray-400">현재 {totalSkips}명이 스킵을 희망합니다.</span>
    </div>
  );
}
