import StatusCard from './StatusCard';
import VoteStatus from './VoteStatus';
import {
  useBattleStore,
  selectCurrentStage,
  selectBattleProgress,
  selectTeamCounts,
  selectBattleId,
  selectSocket
} from '../../stores/battleStore';
import { useBattleTimer } from '../../hooks/useBattleTimer';

export default function BattleHeader() {
  const currentStage = useBattleStore(selectCurrentStage);
  const battleProgress = useBattleStore(selectBattleProgress);
  const { teamACount, teamBCount, none } = useBattleStore(selectTeamCounts);
  const battleId = useBattleStore(selectBattleId);
  const socket = useBattleStore(selectSocket);

  const { formattedTime } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt
  });

  const status = currentStage || 'END';

  const handleStart = () => {
    if (!socket || !battleId) return;
    socket.emit('battle:start', { battleId });
  };

  const showStartButton = currentStage === 'PENDING';

  return (
    <header className="bg-[#1E1E2F] px-8 py-6 rounded-lg mb-2">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <StatusCard phase={status} timer={formattedTime} />
          <VoteStatus teamACounts={teamACount} teamBCounts={teamBCount} teamNoneCounts={none} />
        </div>
        {showStartButton && (
          <button
            type="button"
            onClick={handleStart}
            className="h-10 px-4 rounded-lg border border-[#FF6900] text-[#FF6900] hover:bg-[#FF6900]/10"
          >
            배틀 시작
          </button>
        )}
      </div>
    </header>
  );
}
