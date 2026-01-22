import BattleIcon from '@/assets/icon/battle.svg?react';

export default function TutorialDiscussionInput() {
  return (
    <section className="discussion-input-width relative rounded-xl overflow-visible border-2 transition-all duration-500 bg-gradient-to-br from-[#1E1E2F] via-[#2D1B3D] to-[#1E1E2F] border-[#FF6900]/30 shadow-[0_0_30px_rgba(255,105,0,0.15)]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg text-xs font-bold tracking-wider uppercase border-x border-b bg-gradient-to-r from-[#FF6900] to-[#FB2C36] border-[#FF6900]/50 text-white">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          1R 이의제기
        </span>
      </div>

      <div className="relative px-5 py-6 pt-8">
        <div className="flex items-center gap-4">
          <div className="rounded-xl flex items-center justify-center shrink-0 w-16 h-16 border-2 border-[#FF6900]/30 bg-[#FF6900]/10 animate-pulse">
            <BattleIcon className="w-8 h-8 text-[#FF6900]" />
          </div>

          <div className="flex-1 flex gap-3">
            <input
              type="text"
              value=""
              readOnly
              placeholder="상대 코드의 문제점을 지적해보세요"
              className="w-full bg-black/30 backdrop-blur-sm rounded-lg px-4 py-3.5 text-sm text-white placeholder-gray-500/60 border-2 border-[#FF6900]/20 focus:outline-none"
            />

            <button
              disabled
              className="px-5 py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap shrink-0 bg-gradient-to-r from-[#FF6900] to-[#FB2C36] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              이의제기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
