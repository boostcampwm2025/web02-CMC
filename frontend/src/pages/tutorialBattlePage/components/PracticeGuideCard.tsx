import type { RefObject } from 'react';

interface PracticeGuideCardProps {
  isVisible: boolean;
  practiceIntroVisible: boolean;
  typingMessage: string;
  typingIndex: number;
  practicePhase: 'idle' | 'attack' | 'defense' | 'teamSwitch' | 'done';
  showMissionFocus: boolean;
  attackSubmitted: boolean;
  attackVoted: boolean;
  defenseSubmitted: boolean;
  defenseVoted: boolean;
  needsAttackSubmit: boolean;
  needsAttackVote: boolean;
  needsDefenseSubmit: boolean;
  needsDefenseVote: boolean;
  needsTeamSwitch: boolean;
  practiceCardRef: RefObject<HTMLDivElement | null>;
  cornerOffset: { x: number; y: number };
}

export default function PracticeGuideCard({
  isVisible,
  practiceIntroVisible,
  typingMessage,
  typingIndex,
  practicePhase,
  showMissionFocus,
  attackSubmitted,
  attackVoted,
  defenseSubmitted,
  defenseVoted,
  needsAttackSubmit,
  needsAttackVote,
  needsDefenseSubmit,
  needsDefenseVote,
  needsTeamSwitch,
  practiceCardRef,
  cornerOffset
}: PracticeGuideCardProps) {
  if (!isVisible) return null;

  return (
    <div
      ref={practiceCardRef}
      className="fixed left-1/2 top-1/2 z-[60] w-[18.5rem] rounded-2xl border border-orange-500/40 bg-[#121726]/95 shadow-xl shadow-orange-500/10 p-4 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        transform: `translate(-50%, -50%) translate3d(${practiceIntroVisible ? 0 : cornerOffset.x}px, ${
          practiceIntroVisible ? 0 : cornerOffset.y
        }px, 0) scale(${practiceIntroVisible ? 2 : 1.5})`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">실전 연습</span>
        <span className="text-[0.625rem] text-gray-400">{practicePhase === 'done' ? '완료' : '진행 중'}</span>
      </div>
      {practiceIntroVisible && (
        <p className="text-sm text-white leading-relaxed mb-4 min-h-[3.5rem] whitespace-pre-line">
          {typingMessage.slice(0, typingIndex).padEnd(1, ' ')}
          <span className="inline-block w-[0.375rem] h-[1rem] align-middle bg-orange-400/80 ml-1 animate-pulse" />
        </p>
      )}
      {practicePhase === 'attack' && (
        <>
          <p className="text-sm text-white font-semibold mb-2">이의제기 턴</p>
          <ul className="space-y-1 text-xs text-[#C5CBD6]">
            <li className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${attackSubmitted ? 'bg-emerald-400' : 'bg-gray-500'}`} />
              <span
                className={
                  showMissionFocus && needsAttackSubmit ? 'text-orange-200 animate-pulse font-semibold' : undefined
                }
              >
                이의제기 1개 작성하기
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${attackVoted ? 'bg-emerald-400' : 'bg-gray-500'}`} />
              <span
                className={
                  showMissionFocus && needsAttackVote ? 'text-orange-200 animate-pulse font-semibold' : undefined
                }
              >
                투표 1회 하기
              </span>
            </li>
          </ul>
        </>
      )}
      {practicePhase === 'defense' && (
        <>
          <p className="text-sm text-white font-semibold mb-2">방어(반론) 턴</p>
          <ul className="space-y-1 text-xs text-[#C5CBD6]">
            <li className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${defenseSubmitted ? 'bg-emerald-400' : 'bg-gray-500'}`} />
              <span
                className={
                  showMissionFocus && needsDefenseSubmit ? 'text-orange-200 animate-pulse font-semibold' : undefined
                }
              >
                반론 1개 작성하기
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${defenseVoted ? 'bg-emerald-400' : 'bg-gray-500'}`} />
              <span
                className={
                  showMissionFocus && needsDefenseVote ? 'text-orange-200 animate-pulse font-semibold' : undefined
                }
              >
                투표 1회 하기
              </span>
            </li>
          </ul>
        </>
      )}
      {practicePhase === 'teamSwitch' && (
        <>
          <p className="text-sm text-white font-semibold mb-2">팀 전환 턴</p>
          <p className="text-xs text-[#C5CBD6] mb-3 whitespace-pre-line">
            {'진영을 바꿔보며 투표 결과를 확인해보세요.\n마지막 라운드에서는 최종 투표가 적용됩니다.'}
          </p>
          {showMissionFocus && needsTeamSwitch && (
            <p className="text-xs text-orange-200 font-semibold animate-pulse">팀 변경 모달에서 진영을 선택하세요.</p>
          )}
        </>
      )}
      {practicePhase === 'done' && (
        <>
          <p className="text-sm text-white font-semibold mb-2">라운드 체험 완료!</p>
          <p className="text-xs text-[#C5CBD6]">이제 실제 배틀에서 흐름을 그대로 따라가면 됩니다.</p>
        </>
      )}
    </div>
  );
}
