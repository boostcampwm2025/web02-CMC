import { useCallback, useEffect, useState } from 'react';
import { selectBattleId, selectSocket, useBattleStore } from '@/features/battle/stores/battleStore';
import { BATTLE_CLIENT_EVENTS, BATTLE_SERVER_EVENTS } from '@cmc/types';

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
      socket.emit(BATTLE_CLIENT_EVENTS.USER_SKIP, { skip: next, battleId: battleId });
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
    socket.on(BATTLE_SERVER_EVENTS.PHASE_SKIPPED, handleTeamUpdateAll);
    socket.on(BATTLE_SERVER_EVENTS.USER_SKIPPED, handleSkipped);
    socket.on(BATTLE_SERVER_EVENTS.LEAVED, handleSkipped);
    socket.on(BATTLE_SERVER_EVENTS.JOINED, handleSkipped);
    socket.on(BATTLE_SERVER_EVENTS.PHASE_UPDATED, handlePhaseUpdated);

    return () => {
      socket.off(BATTLE_SERVER_EVENTS.PHASE_SKIPPED, handleTeamUpdateAll);
      socket.off(BATTLE_SERVER_EVENTS.USER_SKIPPED, handleSkipped);
      socket.off(BATTLE_SERVER_EVENTS.LEAVED, handleSkipped);
      socket.off(BATTLE_SERVER_EVENTS.JOINED, handleSkipped);
      socket.off(BATTLE_SERVER_EVENTS.PHASE_UPDATED, handlePhaseUpdated);
    };
  }, [socket]);

  return { isSkipEnabled, totalSkips, isModalOpen, closeModal, toggleSkip };
}
