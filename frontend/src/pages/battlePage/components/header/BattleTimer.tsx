import { useBattleStore, selectBattleProgress } from '../../stores/battleStore';
import { useBattleTimer } from '../../hooks/useBattleTimer';

export default function BattleTimer() {
  const battleProgress = useBattleStore(selectBattleProgress);

  const { formattedTime, remainingSeconds } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt
  });

  const isUrgent = remainingSeconds <= 5;

  return (
    <div className={`text-[72px] font-bold tracking-wider ${isUrgent ? 'text-red-500' : 'text-white'}`}>
      {formattedTime}
    </div>
  );
}
