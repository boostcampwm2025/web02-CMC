import ParticipantRatioBar from './ParticipantRatioBar';
import Button from '@/commons/components/Button';
import StageIndicator from './StageIndicator';
import BattleTimer from './BattleTimer';
import TeamCounter from './TeamCounter';
import {
  useBattleStore,
  selectBattleProgress,
  selectBattleId,
  selectSocket,
  selectSelectedTeam
} from '@/features/battle/stores/battleStore';
import type { BattlePhaseName } from '@/commons/types/battle';
import PhaseSkip from './PhaseSkip';

const PHASE_INSTRUCTIONS: Record<BattlePhaseName, string> = {
  PENDING: '',
  OPINION_SHARE: '자유롭게 의견을 작성하고 투표에 참여해주세요',
  ATTACK: '주어진 시간 내에 상대 코드의 문제점을 지적해주세요',
  DEFENSE: '상대의 공격에 대한 반박 논리를 작성해주세요',
  TEAM_SWITCH: '원하시는 팀으로 변경하실 수 있습니다'
};

interface BattleHeaderProps {
  isSkipEnabled: boolean;
  toggleSkip: () => void;
  totalSkips: number;
}

export default function BattleHeader({ isSkipEnabled, toggleSkip, totalSkips }: BattleHeaderProps) {
  const battleProgress = useBattleStore(selectBattleProgress);
  const team = useBattleStore(selectSelectedTeam);
  const battleId = useBattleStore(selectBattleId);
  const socket = useBattleStore(selectSocket);
  const phase = (battleProgress?.phase as BattlePhaseName) || 'PENDING';
  const instruction = PHASE_INSTRUCTIONS[phase] || PHASE_INSTRUCTIONS.PENDING;

  const isSkipVisible = team !== 'NONE';

  const handleStart = () => {
    if (!socket || !battleId) return;
    socket.emit('battle:start', { battleId });
  };

  return (
    <header
      className="header-height main-width-closed bg-[#1E1E2F] rounded-lg mb-2 flex flex-col"
      data-tutorial="phase-guide"
    >
      <div className="px-8 flex-1 grid grid-cols-3 items-center">
        <StageIndicator />
        <div className="flex flex-col items-center justify-center" data-tutorial="timer">
          {phase === 'PENDING' ? (
            <Button
              type="button"
              onClick={handleStart}
              variant="ghost"
              className="border-[#FF6900] text-[#FF6900] hover:bg-[#FF6900]/10 hover:text-[#FF6900]"
            >
              배틀 시작
            </Button>
          ) : (
            <>
              <BattleTimer />
              <p className="text-sm text-gray-400">{instruction}</p>
            </>
          )}
        </div>
        <div className="flex items-center">
          <div className="ml-auto flex items-center">
            {isSkipVisible && (
              <>
                <PhaseSkip
                  phase={phase}
                  isSkipEnabled={isSkipEnabled}
                  toggleSkip={toggleSkip}
                  totalSkips={totalSkips}
                />
                <div className="mx-4 h-6 border-l-2 border-gray-700" />
              </>
            )}

            <TeamCounter />
          </div>
        </div>
      </div>
      <ParticipantRatioBar />
    </header>
  );
}
