import { createPortal } from 'react-dom';
import Modal from '@/commons/components/Modal';
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
  isOpen: boolean;
  topics: string[];
  handleTeamChange: (team: 'A' | 'B' | 'NONE') => void;
  onClose: () => void;
  className?: string;
}

export default function TeamChangeModal({
  isOpen,
  topics,
  handleTeamChange,
  onClose,
  className
}: TeamChangeModalProps) {
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);
  const currentTeam = useBattleStore(selectSelectedTeam);
  const battleProgress = useBattleStore(selectBattleProgress);
  const timelines = useBattleStore(selectTimelines);

  const { formattedTime: remainingTime } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt ?? undefined
  });

  const noneTeamCount = 0;
  const currentRound = battleProgress?.round ?? 1;
  const currentTopic = topics[currentRound - 1];

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  // 이벤트 핸들러
  const handleClick = (team: 'A' | 'B' | 'NONE') => {
    handleTeamChange(team);
    onClose();
  };

  return createPortal(
    <Modal isOpen={isOpen} bg="bg-black/50" blur="" className="p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-lg bg-[#1E1E2F] border-[0.188rem] border-[#FF6900] shadow-2xl flex flex-col gap-4 p-6 text-white my-8 ${className ?? ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 타임라인 섹션 */}
        <TimelineSection topic={currentTopic} currentRound={currentRound} timelines={timelines} />

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
    </Modal>,
    modalRoot
  );
}
