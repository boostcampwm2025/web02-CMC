import { useCallback, useEffect, useState } from 'react';
import { selectSocket, useBattleStore } from '../stores/battleStore';

export function usePhaseSkip() {
  const socket = useBattleStore(selectSocket);
  const [isSkipEnabled, setIsSkipEnabled] = useState(false);
  const [totalSkips, setTotalSkips] = useState(0);

  const toggleSkip = useCallback(() => {
    if (!socket) return;

    setIsSkipEnabled((prev) => {
      const next = !prev;
      socket.emit('battle:phase:skip', { skip: next });
      return next;
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleSkipped = (data: { totalSkips: number }) => {
      setTotalSkips(data.totalSkips);
    };

    const handlePhaseUpdated = () => {
      setIsSkipEnabled(false);
      setTotalSkips(0);
    };

    socket.on('battle:phase:skipped', handleSkipped);
    socket.on('battle:phase:updated', handlePhaseUpdated);

    return () => {
      socket.off('battle:phase:skipped', handleSkipped);
      socket.off('battle:phase:updated', handlePhaseUpdated);
    };
  }, [socket]);

  return { isSkipEnabled, totalSkips, toggleSkip };
}
