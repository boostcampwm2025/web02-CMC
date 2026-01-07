import { useBattleStore, selectBattleProgress } from '../../stores/battleStore';
import { useBattleTimer } from '../../hooks/useBattleTimer';

export default function BattleTimer() {
  const battleProgress = useBattleStore(selectBattleProgress);

  const { formattedTime } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt
  });

  return (
    <div className="flex flex-col items-center">
      <div className="text-[72px] font-bold text-white">{formattedTime}</div>
    </div>
  );
}
