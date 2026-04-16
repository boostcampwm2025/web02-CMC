import { useEffect, useRef } from 'react';
import { useBattleStore, selectBattleProgress } from '@/features/battle/stores/battleStore';
import { useBattleTimer } from '../../hooks/useBattleTimer';
import { soundManager } from '@/commons/utils/soundManager';

export default function BattleTimer() {
  const battleProgress = useBattleStore(selectBattleProgress);

  const { formattedTime, remainingSeconds } = useBattleTimer({
    expiredAt: battleProgress?.expiredAt ?? undefined
  });

  const isUrgent = remainingSeconds <= 5;
  const hasPlayedWarning = useRef(false);

  useEffect(() => {
    if (remainingSeconds === 5 && !hasPlayedWarning.current) {
      soundManager.play('timerWarning');
      hasPlayedWarning.current = true;
    }

    if (remainingSeconds > 5) {
      hasPlayedWarning.current = false;
    }
  }, [remainingSeconds]);

  return (
    <div
      className={`text-7xl font-bold tracking-wider mb-2 ${isUrgent ? 'text-red-500 animate-timer-shake' : 'text-white'}`}
    >
      {formattedTime}
    </div>
  );
}
