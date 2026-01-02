import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import type { BattleProgressState } from '@/commons/types/battle';
import { useBattleStore } from '../stores/battleStore';

interface UseBattleProgressProps {
  socket: Socket | null;
}

export function useBattleProgress({ socket }: UseBattleProgressProps) {
  const { setCurrentStage, updateBattleProgress } = useBattleStore();
  const navigate = useNavigate();

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

    // 배틀 종료 이벤트 구독
    const handleBattleClosed = (payload: { battleId: string }) => {
      navigate(`/battle/${payload.battleId}/result`);
    };
    socket.on('battle:closed', handleBattleClosed);

    return () => {
      socket.off('battle:phase:update', handlePhaseUpdate);
      socket.off('battle:turn:update', handleTurnUpdate);
      socket.off('battle:round:update', handleRoundUpdate);
      socket.off('battle:closed', handleBattleClosed);
    };
  }, [socket, setCurrentStage, updateBattleProgress, navigate]);
}
