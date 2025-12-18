import { createPortal } from 'react-dom';
import VoteIcon from '@/assets/icon/vote.svg?react';
import TimerIcon from '@/assets/icon/timer.svg?react';

interface TeamChangeModalProps {
  aTeamCounts: number;
  bTeamCounts: number;
  currentTeam: 'A' | 'B' | 'NONE';
  remainingTime: string;
  noneTeamCounts: number;
  handleTeamChange: (team: 'A' | 'B' | 'NONE') => void;
  onClose: () => void;
}

export default function TeamChangeModal({
  aTeamCounts,
  bTeamCounts,
  noneTeamCounts,
  remainingTime,
  currentTeam,
  handleTeamChange,
  onClose
}: TeamChangeModalProps) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleClick = (team: 'A' | 'B' | 'NONE') => {
    handleTeamChange(team);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="w-[670px] h-[470px] rounded-lg bg-[#1E1E2F] border-[3px] border-[#FF6900] shadow-2xl flex flex-col justify-center items-center gap-2 p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <VoteIcon className="text-[#FF6900] w-[64px] h-[64px]" />
        <h2 className="text-[24px] font-bold">투표 시간입니다!</h2>
        <p className="text-[#99A1AF] text-[16px]">어느 팀을 지지하시나요?</p>
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
            <span>{aTeamCounts}명</span>
          </button>
          <button
            type="button"
            onClick={() => handleClick('NONE')}
            className="w-[200px] h-[150px] rounded-lg border border-[#6A7282] bg-[#364153] hover:bg-[#6A7282] flex flex-col justify-center items-center gap-2 transition-colors"
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
            <span>{bTeamCounts}명</span>
          </button>
        </div>
        <p className="text-[#6A7282] text-[14px]">💡투표 후에도 다음 투표 시간에 팀을 변경할 수 있어요</p>
      </div>
    </div>,
    modalRoot
  );
}
