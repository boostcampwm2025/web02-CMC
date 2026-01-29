import { useEffect, useRef } from 'react';

export function useAutoExitOnDone(isDone: boolean, onExit: () => void, delayMs = 5000) {
  const hasScheduled = useRef(false);

  useEffect(() => {
    if (!isDone) return;
    if (hasScheduled.current) return;
    hasScheduled.current = true;
    const timer = setTimeout(() => {
      onExit();
    }, delayMs);
    return () => clearTimeout(timer);
  }, [isDone, onExit, delayMs]);
}
