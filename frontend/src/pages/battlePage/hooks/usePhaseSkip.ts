import { useCallback, useEffect, useState } from 'react';
import { selectBattleId, selectSocket, useBattleStore } from '../stores/battleStore';

export function usePhaseSkip() {
  const socket = useBattleStore(selectSocket);
  const battleId = useBattleStore(selectBattleId);
  const [isSkipEnabled, setIsSkipEnabled] = useState(false);
  const [totalSkips, setTotalSkips] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSkip = useCallback(() => {
    if (!socket) return;

    setIsSkipEnabled((prev) => {
      const next = !prev;
      socket.emit('battle:user:skip', { skip: next, battleId: battleId });
      return next;
    });
  }, [socket, battleId]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!socket) return;

    const handleSkipped = (data: { totalSkips: number }) => {
      setTotalSkips(data.totalSkips);
    };

    const handleTeamUpdateAll = () => {
      setIsModalOpen(true);
    };

    const handlePhaseUpdated = () => {
      setIsSkipEnabled(false);
      setTotalSkips(0);
    };
    socket.on('battle:phase:skipped', handleTeamUpdateAll);
    socket.on('battle:user:skipped', handleSkipped);
    socket.on('battle:leaved', handleSkipped);
    socket.on('battle:joined', handleSkipped);
    socket.on('battle:phase:updated', handlePhaseUpdated);

    return () => {
      socket.off('battle:phase:skipped', handleTeamUpdateAll);
      socket.off('battle:user:skipped', handleSkipped);
      socket.off('battle:leaved', handleSkipped);
      socket.off('battle:joined', handleSkipped);
      socket.off('battle:phase:updated', handlePhaseUpdated);
    };
  }, [socket]);

  return { isSkipEnabled, totalSkips, isModalOpen, closeModal, toggleSkip };
}
