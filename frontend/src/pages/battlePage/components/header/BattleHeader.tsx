import StatusCard from './StatusCard';
import VoteStatus from './VoteStatus';
import { useBattleStore, selectCurrentStage, selectBattleProgress, selectTeamCounts } from '../../stores/battleStore';
import { useBattleTimer } from '../../hooks/useBattleTimer';

interface BattleHeaderProps {
  title: string;
  description: string;
}

export default function BattleHeader({ title, description }: BattleHeaderProps) {
  const currentStage = useBattleStore(selectCurrentStage);
  const battleProgress = useBattleStore(selectBattleProgress);
  const { teamACount, teamBCount } = useBattleStore(selectTeamCounts);

  const { formattedTime } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt
  });

  const status = currentStage || 'END';
  const teamNoneCounts = 0;
  return (
    <header className="bg-[#1E1E2F] px-8 py-6 rounded-lg mb-2">
      <div className="flex justify-between">
        <div>
          <h1 className="text-[20px] text-left font-bold mb-2">{title}</h1>
          <p className="text-[#99A1AF] text-[14px]">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusCard phase={status} timer={formattedTime} />
          <VoteStatus teamACounts={teamACount} teamBCounts={teamBCount} teamNoneCounts={teamNoneCounts} />
        </div>
      </div>
    </header>
  );
}
