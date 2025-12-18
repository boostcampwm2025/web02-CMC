import { useState, useEffect } from 'react';

interface UseBattleTimerProps {
  expiredAt?: number;
}

export function useBattleTimer({ expiredAt }: UseBattleTimerProps) {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!expiredAt) return;

    const updateRemainingTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiredAt - now);
      setRemainingTime(Math.floor(remaining / 1000));
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [expiredAt]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    remainingTime,
    formattedTime: formatTime(remainingTime)
  };
}
