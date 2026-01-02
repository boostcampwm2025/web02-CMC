import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { BattleProgressState } from '@/commons/types/battle';
import { useBattleStore } from '../stores/battleStore';

interface UseBattleProgressProps {
  socket: Socket | null;
}

export function useBattleProgress({ socket }: UseBattleProgressProps) {
  const { setCurrentStage, updateBattleProgress } = useBattleStore();

  useEffect(() => {
    if (!socket) return;

    // Phase 변경 이벤트 구독
    const handlePhaseUpdate = (data: BattleProgressState) => {
      updateBattleProgress({
        phase: data.phase,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      });
      setCurrentStage(data.phase);
    };

    // Turn 변경 이벤트 구독
    const handleTurnUpdate = (data: BattleProgressState) => {
      updateBattleProgress({
        turn: data.turn,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      });
      setCurrentStage(data.turn?.status || null);
    };

    // Round 변경 이벤트 구독
    const handleRoundUpdate = (data: { battleId: string; round: number }) => {
      updateBattleProgress({
        round: data.round
      });
    };

    socket.on('battle:phase:update', handlePhaseUpdate);
    socket.on('battle:turn:update', handleTurnUpdate);
    socket.on('battle:round:update', handleRoundUpdate);

    return () => {
      socket.off('battle:phase:update', handlePhaseUpdate);
      socket.off('battle:turn:update', handleTurnUpdate);
      socket.off('battle:round:update', handleRoundUpdate);
    };
  }, [socket, setCurrentStage, updateBattleProgress]);
}
