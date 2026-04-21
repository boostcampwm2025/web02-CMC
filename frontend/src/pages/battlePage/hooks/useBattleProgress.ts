import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import type { BattleProgressState } from '@/commons/types/battle';
import { useBattleStore, selectSocket } from '@/features/battle/stores/battleStore';
import { BATTLE_SERVER_EVENTS } from '@cmc/types';
import { useRoundUpdateModal } from './useRoundUpdateModal';
import { soundManager } from '@/commons/utils/soundManager';

export function useBattleProgress() {
  const socket = useBattleStore(selectSocket);
  const { setCurrentStage, updateBattleProgress } = useBattleStore();
  const { roundModal, showEffect, hideEffect } = useRoundUpdateModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // Phase 변경 이벤트 구독
    const handlePhaseUpdate = (data: BattleProgressState) => {
      // 페이즈 전환 효과음 재생
      soundManager.play('click');

      updateBattleProgress({
        phase: data.phase,
        phaseCount: data.phaseCount,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      });
      setCurrentStage(data.phase);

      Sentry.addBreadcrumb({
        category: 'battle',
        message: `배틀 페이즈 변경 - ${data.phase}`,
        level: 'info',
        data: {
          phase: data.phase,
          round: useBattleStore.getState().battleProgress?.round
        }
      });

      // 페이즈가 변경되면 투표 리스트 초기화
      useBattleStore.getState().setDiscussions([]);
      useBattleStore.getState().commitOpponentNotice();
    };

    // Round 변경 이벤트 구독
    const handleRoundUpdate = (data: { battleId: string; round: number; topic: string }) => {
      updateBattleProgress({
        round: data.round,
        topic: data.topic
      });

      Sentry.addBreadcrumb({
        category: 'battle',
        message: `배틀 라운드 변경 - Round ${data.round}`,
        level: 'info',
        data: {
          round: data.round,
          topic: data.topic
        }
      });

      showEffect(data.round, data.topic);
    };

    socket.on(BATTLE_SERVER_EVENTS.PHASE_UPDATED, handlePhaseUpdate);
    socket.on(BATTLE_SERVER_EVENTS.ROUND_UPDATED, handleRoundUpdate);

    const handleBattleClosed = (data: { battleId: string }) => {
      const { isTeamVoteResultShowing, setPendingBattleClosed } = useBattleStore.getState();

      if (isTeamVoteResultShowing) {
        setPendingBattleClosed(true);
      } else {
        soundManager.stopAllBGM();
        navigate(`/battles/${data.battleId}/result`);
      }
    };
    socket.on(BATTLE_SERVER_EVENTS.CLOSED, handleBattleClosed);

    return () => {
      socket.off(BATTLE_SERVER_EVENTS.PHASE_UPDATED, handlePhaseUpdate);
      socket.off(BATTLE_SERVER_EVENTS.ROUND_UPDATED, handleRoundUpdate);
      socket.off(BATTLE_SERVER_EVENTS.CLOSED, handleBattleClosed);
    };
  }, [socket, setCurrentStage, updateBattleProgress, navigate, showEffect]);

  return { roundModal, hideRoundEffect: hideEffect };
}
