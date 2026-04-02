import Icon from '@/commons/components/Icon';
import type { VotingSectionProps } from './types';

/**
 * 투표 섹션 컴포넌트
 *
 * @description
 * 팀 선택 투표 UI를 표시합니다.
 * - 남은 시간 타이머
 * - A팀, 중립, B팀 선택 버튼
 * - 각 팀의 현재 인원수
 * - 안내 문구
 */
export default function VotingSection({
  currentTeam,
  teamACount,
  teamBCount,
  noneTeamCount,
  remainingTime,
  onTeamChange
}: VotingSectionProps) {
  return (
    <div className="flex flex-col items-center gap-2 border-t border-[#2d2d3f] pt-4">
      {/* 타이머 */}
      <div className="text-[#FF8904] text-2xl font-bold my-2 flex items-center">
        <Icon name="timer" className="w-6 h-6 mr-2" />
        <span>{remainingTime}</span>
      </div>

      {/* 팀 선택 버튼들 */}
      <div className="flex gap-4">
        {/* A팀 버튼 */}
        <button
          type="button"
          onClick={() => onTeamChange('A')}
          className="w-50 h-38 rounded-lg border border-[#155DFC] bg-[#1C398E] hover:bg-[#155DFC] flex flex-col justify-center items-center gap-2 transition-colors relative"
        >
          {currentTeam === 'A' && <span className="absolute top-2 right-2 text-[#155DFC] text-2xl">✓</span>}
          <span className="text-lg font-bold">A팀</span>
          <span>{teamACount}명</span>
        </button>

        {/* 중립 버튼 */}
        <button
          type="button"
          onClick={() => onTeamChange('NONE')}
          className="w-50 h-38 rounded-lg border border-[#6A7282] bg-[#364153] hover:bg-[#6A7282] flex flex-col justify-center items-center gap-2 transition-colors relative"
        >
          {currentTeam === 'NONE' && <span className="absolute top-2 right-2 text-[#6A7282] text-2xl">✓</span>}
          <span className="text-lg font-bold">중립</span>
          <span>{noneTeamCount}명</span>
        </button>

        {/* B팀 버튼 */}
        <button
          type="button"
          onClick={() => onTeamChange('B')}
          className="w-50 h-38 rounded-lg border border-[#FB2C36] bg-[#82181A] hover:bg-[#FB2C36] flex flex-col justify-center items-center gap-2 transition-colors relative"
        >
          {currentTeam === 'B' && <span className="absolute top-2 right-2 text-[#FB2C36] text-2xl">✓</span>}
          <span className="text-lg font-bold">B팀</span>
          <span>{teamBCount}명</span>
        </button>
      </div>

      {/* 안내 문구 */}
      <p className="text-[#6A7282] text-sm">💡투표 후에도 다음 투표 시간에 팀을 변경할 수 있어요</p>
    </div>
  );
}
