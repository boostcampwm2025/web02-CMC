import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BattlePhaseResponse, BattleRoundResponse, BattleClosedResponse } from '@cmc/types';
import { useBattleStore, selectSocket } from '../stores/battleStore';
import { useRoundUpdateModal } from './useRoundUpdateModal';

export function useBattleProgress() {
  const socket = useBattleStore(selectSocket);
  const { setCurrentStage, updateBattleProgress } = useBattleStore();
  const { roundModal, showEffect, hideEffect } = useRoundUpdateModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // Phase 변경 이벤트 구독
    const handlePhaseUpdate = (data: BattlePhaseResponse) => {
      updateBattleProgress({
        phase: data.phase,
        phaseCount: data.phaseCount,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      });
      setCurrentStage(data.phase);

      // 페이즈가 변경되면 투표 리스트 초기화
      useBattleStore.getState().setDiscussions([]);
      useBattleStore.getState().commitOpponentNotice();
    };

    // Round 변경 이벤트 구독
    const handleRoundUpdate = (data: BattleRoundResponse) => {
      updateBattleProgress({
        round: data.round,
        topic: data.topic
      });

      showEffect(data.round, data.topic);
    };

    socket.on('battle:phase:updated', handlePhaseUpdate);
    socket.on('battle:round:updated', handleRoundUpdate);

    // 배틀 종료 이벤트 구독
    const handleBattleClosed = (data: BattleClosedResponse) => {
      navigate(`/battle/${data.battleId}/result`);
    };
    socket.on('battle:closed', handleBattleClosed);

    return () => {
      socket.off('battle:phase:updated', handlePhaseUpdate);
      socket.off('battle:round:updated', handleRoundUpdate);
      socket.off('battle:closed', handleBattleClosed);
    };
  }, [socket, setCurrentStage, updateBattleProgress, navigate, showEffect]);

  return { roundModal, hideRoundEffect: hideEffect };
}
