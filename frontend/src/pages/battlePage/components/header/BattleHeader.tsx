import StatusCard from './StatusCard';
import VoteStatus from './VoteStatus';
import { useBattleStore, selectCurrentStage, selectBattleProgress, selectTeamCounts } from '../../stores/battleStore';
import { useBattleTimer } from '../../hooks/useBattleTimer';

export default function BattleHeader() {
  const currentStage = useBattleStore(selectCurrentStage);
  const battleProgress = useBattleStore(selectBattleProgress);
  const { teamACount, teamBCount, none } = useBattleStore(selectTeamCounts);

  const { formattedTime } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt
  });

  const status = currentStage || 'END';
  return (
    <header className="bg-[#1E1E2F] px-8 py-6 rounded-lg mb-2">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <StatusCard turn={status} timer={formattedTime} />
          <VoteStatus teamACounts={teamACount} teamBCounts={teamBCount} teamNoneCounts={none} />
        </div>
      </div>
    </header>
  );
}
