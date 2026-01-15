import { createPortal } from 'react-dom';
import TimerIcon from '@/assets/icon/timer.svg?react';
import { Zap, Shield, ArrowRight } from 'lucide-react';
import {
  useBattleStore,
  selectTeamCounts,
  selectSelectedTeam,
  selectBattleProgress,
  selectTimelines
} from '../../stores/battleStore';
import { useBattleTimer } from '../../hooks/useBattleTimer';
import type { BattleDiscussion, BattleDefense } from '@/commons/types/battle';

interface TeamChangeModalProps {
  handleTeamChange: (team: 'A' | 'B' | 'NONE') => void;
  onClose: () => void;
}

export default function TeamChangeModal({ handleTeamChange, onClose }: TeamChangeModalProps) {
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);
  const currentTeam = useBattleStore(selectSelectedTeam);
  const battleProgress = useBattleStore(selectBattleProgress);
  const timelines = useBattleStore(selectTimelines);

  const { formattedTime: remainingTime } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt ?? undefined
  });

  const noneTeamCounts = 0;
  const currentRound = battleProgress?.round ?? 1;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleClick = (team: 'A' | 'B' | 'NONE') => {
    handleTeamChange(team);
    onClose();
  };

  // 현재 라운드의 타임라인 데이터 추출
  // 한 라운드 = 2번의 공수 전환 (각각 A공격→B수비, B공격→A수비)
  const roundIndex = (currentRound - 1) * 4;

  // 첫 번째 공수 전환
  const turn1_AttackA = timelines?.attacks[roundIndex] || null;
  const turn1_DefenseB = timelines?.defenses[roundIndex] || null;
  const turn1_AttackB = timelines?.attacks[roundIndex + 1] || null;
  const turn1_DefenseA = timelines?.defenses[roundIndex + 1] || null;

  // 두 번째 공수 전환
  const turn2_AttackA = timelines?.attacks[roundIndex + 2] || null;
  const turn2_DefenseB = timelines?.defenses[roundIndex + 2] || null;
  const turn2_AttackB = timelines?.attacks[roundIndex + 3] || null;
  const turn2_DefenseA = timelines?.defenses[roundIndex + 3] || null;

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '알 수 없음';

    const now = new Date().getTime();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    return `${Math.floor(minutes / 60)}시간 전`;
  };

  const renderMessage = (
    message: BattleDiscussion | BattleDefense | null,
    team: 'A' | 'B',
    type: 'challenge' | 'rebuttal'
  ) => {
    if (!message) {
      return (
        <div className="p-4 text-center">
          <div className="text-gray-600 text-sm">
            {type === 'challenge' ? '이의제기 대기 중...' : '반론 대기 중...'}
          </div>
        </div>
      );
    }

    const isTeamA = team === 'A';

    return (
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${
                isTeamA ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {isTeamA ? 'A팀' : 'B팀'}
            </span>
            <span className="text-white font-medium text-xs">
              {message.authorId ? `User-${message.authorId.slice(0, 6)}` : '익명'}
            </span>
          </div>
          <span className="text-gray-500 text-xs">{formatTime(message.selectedAt)}</span>
        </div>

        {/* Content */}
        <p className="text-gray-300 leading-relaxed text-sm">{message.content}</p>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="w-full max-w-[900px] rounded-lg bg-[#1E1E2F] border-[3px] border-[#FF6900] shadow-2xl flex flex-col gap-4 p-6 text-white my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 타임라인 섹션 */}
        <div>
          <h3 className="text-[18px] font-bold text-center mb-4">Round {currentRound} 진영 선택</h3>

          {/* 첫 번째 공수: A 이의제기 → B 반론 */}
          <div className="relative bg-[#1a1a2e] rounded-xl border-2 border-[#2d2d3f] overflow-hidden mb-4">
            <div className="px-4 py-2 bg-gradient-to-r from-orange-900/20 to-blue-900/20 border-b border-[#2d2d3f]">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">A 이의제기</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">B 반론</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-b md:border-b-0 md:border-r border-[#2d2d3f] bg-gradient-to-r from-orange-500/5 to-transparent">
                {renderMessage(turn1_AttackA, 'A', 'challenge')}
              </div>
              <div className="bg-gradient-to-l from-blue-500/5 to-transparent">
                {renderMessage(turn1_DefenseB, 'B', 'rebuttal')}
              </div>
            </div>
          </div>

          {/* 첫 번째 공수: B 이의제기 → A 반론 */}
          <div className="relative bg-[#1a1a2e] rounded-xl border-2 border-[#2d2d3f] overflow-hidden mb-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-900/20 to-red-900/20 border-b border-[#2d2d3f]">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-bold text-xs uppercase tracking-wider">B 이의제기</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">A 반론</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-b md:border-b-0 md:border-r border-[#2d2d3f] bg-gradient-to-r from-red-500/5 to-transparent">
                {renderMessage(turn1_AttackB, 'B', 'challenge')}
              </div>
              <div className="bg-gradient-to-l from-blue-500/5 to-transparent">
                {renderMessage(turn1_DefenseA, 'A', 'rebuttal')}
              </div>
            </div>
          </div>

          {/* 두 번째 공수: A 이의제기 → B 반론 */}
          <div className="relative bg-[#1a1a2e] rounded-xl border-2 border-[#2d2d3f] overflow-hidden mb-4">
            <div className="px-4 py-2 bg-gradient-to-r from-orange-900/20 to-blue-900/20 border-b border-[#2d2d3f]">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">A 이의제기</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">B 반론</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-b md:border-b-0 md:border-r border-[#2d2d3f] bg-gradient-to-r from-orange-500/5 to-transparent">
                {renderMessage(turn2_AttackA, 'A', 'challenge')}
              </div>
              <div className="bg-gradient-to-l from-blue-500/5 to-transparent">
                {renderMessage(turn2_DefenseB, 'B', 'rebuttal')}
              </div>
            </div>
          </div>

          {/* 두 번째 공수: B 이의제기 → A 반론 */}
          <div className="relative bg-[#1a1a2e] rounded-xl border-2 border-[#2d2d3f] overflow-hidden mb-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-900/20 to-red-900/20 border-b border-[#2d2d3f]">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-bold text-xs uppercase tracking-wider">B 이의제기</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">A 반론</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-b md:border-b-0 md:border-r border-[#2d2d3f] bg-gradient-to-r from-red-500/5 to-transparent">
                {renderMessage(turn2_AttackB, 'B', 'challenge')}
              </div>
              <div className="bg-gradient-to-l from-blue-500/5 to-transparent">
                {renderMessage(turn2_DefenseA, 'A', 'rebuttal')}
              </div>
            </div>
          </div>
        </div>

        {/* 투표 섹션 */}
        <div className="flex flex-col items-center gap-2 border-t border-[#2d2d3f] pt-4">
          <div className="text-[#FF8904] text-[24px] font-bold my-2 flex items-center">
            <TimerIcon className="w-[24px] h-[24px] mr-2" />
            <span>{remainingTime}</span>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleClick('A')}
              className="w-[200px] h-[150px] rounded-lg border border-[#155DFC] bg-[#1C398E] hover:bg-[#155DFC] flex flex-col justify-center items-center gap-2 transition-colors relative"
            >
              {currentTeam === 'A' && <span className="absolute top-2 right-2 text-[#155DFC] text-[24px]">✓</span>}
              <span className="text-[18px] font-bold">A팀</span>
              <span>{teamACount}명</span>
            </button>
            <button
              type="button"
              onClick={() => handleClick('NONE')}
              className="w-[200px] h-[150px] rounded-lg border border-[#6A7282] bg-[#364153] hover:bg-[#6A7282] flex flex-col justify-center items-center gap-2 transition-colors relative"
            >
              {currentTeam === 'NONE' && <span className="absolute top-2 right-2 text-[#6A7282] text-[24px]">✓</span>}
              <span className="text-[18px] font-bold">중립</span>
              <span>{noneTeamCounts}명</span>
            </button>
            <button
              type="button"
              onClick={() => handleClick('B')}
              className="w-[200px] h-[150px] rounded-lg border border-[#FB2C36] bg-[#82181A] hover:bg-[#FB2C36] flex flex-col justify-center items-center gap-2 transition-colors relative"
            >
              {currentTeam === 'B' && <span className="absolute top-2 right-2 text-[#FB2C36] text-[24px]">✓</span>}
              <span className="text-[18px] font-bold">B팀</span>
              <span>{teamBCount}명</span>
            </button>
          </div>
          <p className="text-[#6A7282] text-[14px]">💡투표 후에도 다음 투표 시간에 팀을 변경할 수 있어요</p>
        </div>
      </div>
    </div>,
    modalRoot
  );
}
