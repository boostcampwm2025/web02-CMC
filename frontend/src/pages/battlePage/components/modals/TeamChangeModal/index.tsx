import { createPortal } from 'react-dom';
import {
  useBattleStore,
  selectTeamCounts,
  selectSelectedTeam,
  selectBattleProgress,
  selectTimelines
} from '../../../stores/battleStore';
import { useBattleTimer } from '../../../hooks/useBattleTimer';
import TimelineSection from './TimelineSection';
import VotingSection from './VotingSection';

interface TeamChangeModalProps {
  handleTeamChange: (team: 'A' | 'B' | 'NONE') => void;
  onClose: () => void;
}

/**
 * 팀 변경 모달 컴포넌트
 *
 * @description
 * TEAM_SWITCH 페이즈에서 사용자가 현재 라운드의 타임라인을 확인하고
 * 지지할 팀을 선택할 수 있는 모달입니다.
 */
export default function TeamChangeModal({ handleTeamChange, onClose }: TeamChangeModalProps) {
  // 데이터 페칭
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);
  const currentTeam = useBattleStore(selectSelectedTeam);
  const battleProgress = useBattleStore(selectBattleProgress);
  const timelines = useBattleStore(selectTimelines);

  const { formattedTime: remainingTime } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt ?? undefined
  });

  const noneTeamCount = 0;
  const currentRound = battleProgress?.round ?? 1;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  // 이벤트 핸들러
  const handleClick = (team: 'A' | 'B' | 'NONE') => {
    handleTeamChange(team);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="w-full max-w-[900px] rounded-lg bg-[#1E1E2F] border-[3px] border-[#FF6900] shadow-2xl flex flex-col gap-4 p-6 text-white my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 타임라인 섹션 */}
        <TimelineSection currentRound={currentRound} timelines={timelines} />

        {/* 투표 섹션 */}
        <VotingSection
          currentTeam={currentTeam}
          teamACount={teamACount}
          teamBCount={teamBCount}
          noneTeamCount={noneTeamCount}
          remainingTime={remainingTime}
          onTeamChange={handleClick}
        />
      </div>
    </div>,
    modalRoot
  );
}
