import { useMemo } from 'react';
import { useBattleStore, selectBattleProgress } from '@/features/battle/stores/battleStore';

export default function TimeProgressBar() {
  const battleProgress = useBattleStore(selectBattleProgress);

  const duration = useMemo(() => {
    if (!battleProgress?.expiredAt || !battleProgress?.startedAt) return 60;
    return Math.max(0, (battleProgress.expiredAt - battleProgress.startedAt) / 1000);
  }, [battleProgress?.expiredAt, battleProgress?.startedAt]);

  return (
    <div className="h-1.5 bg-gray-700 overflow-hidden">
      <div
        key={`${battleProgress?.expiredAt}-${battleProgress?.startedAt}`}
        className="h-full bg-blue-500"
        style={{
          animation: `shrink ${duration}s linear`,
          animationFillMode: 'forwards'
        }}
      />
    </div>
  );
}
