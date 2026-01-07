import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BattleProgressState } from '@/commons/types/battle';
import { useBattleStore, selectSocket } from '../stores/battleStore';

export function useBattleProgress() {
  const socket = useBattleStore(selectSocket);
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

      // 페이즈가 변경되면 투표 리스트 초기화
      useBattleStore.getState().setDiscussions([]);
    };

    // Turn 변경 이벤트 구독
    const handleTurnUpdate = (data: BattleProgressState) => {
      updateBattleProgress({
        turn: data.turn,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      });
      setCurrentStage(data.turn?.status || null);

      // 턴이 변경되면 투표 리스트 초기화
      useBattleStore.getState().setDiscussions([]);
    };

    // Round 변경 이벤트 구독
    const handleRoundUpdate = (data: { battleId: string; round: number }) => {
      updateBattleProgress({
        round: data.round
      });
    };

    socket.on('battle:phase:updated', handlePhaseUpdate);
    socket.on('battle:turn:updated', handleTurnUpdate);
    socket.on('battle:round:updated', handleRoundUpdate);

    // 배틀 종료 이벤트 구독
    const handleBattleClosed = (data: { battleId: string }) => {
      navigate(`/battle/${data.battleId}/result`);
    };
    socket.on('battle:closed', handleBattleClosed);

    return () => {
      socket.off('battle:phase:updated', handlePhaseUpdate);
      socket.off('battle:turn:updated', handleTurnUpdate);
      socket.off('battle:round:updated', handleRoundUpdate);
      socket.off('battle:closed', handleBattleClosed);
    };
  }, [socket, setCurrentStage, updateBattleProgress, navigate]);
}
