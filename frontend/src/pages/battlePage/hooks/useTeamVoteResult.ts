import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleStore, selectSocket, selectBattleId } from '../stores/battleStore';
import type { BattleTeamUpdateAllResponse } from '@/commons/types/battle';
import { soundManager } from '@/commons/utils/soundManager';

export function useTeamVoteResult() {
  const socket = useBattleStore(selectSocket);
  const battleId = useBattleStore(selectBattleId);
  const navigate = useNavigate();
  const { setTeamCounts, setIsTeamVoteResultShowing, setPendingBattleClosed } = useBattleStore();

  const [voteResult, setVoteResult] = useState<BattleTeamUpdateAllResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const autoCloseTimerRef = useRef<number | null>(null);

  // battle:all:updated 이벤트 구독
  useEffect(() => {
    if (!socket) return;

    const handleTeamUpdateAll = (data: BattleTeamUpdateAllResponse) => {
      if (data.battleId !== battleId) return;

      // Store에 최종 인원 수 업데이트
      setTeamCounts({
        teamACount: data.after.teamA,
        teamBCount: data.after.teamB,
        none: data.after.teamNone
      });

      // 모달용 전체 데이터 저장
      setVoteResult(data);
      setIsModalOpen(true);
      setIsTeamVoteResultShowing(true); // 모달 표시 중 플래그 ON

      // 팀 투표 결과 효과음 재생
      soundManager.play('fanfare');

      // battle:closed가 대기 중이면 5초 후 자동 이동
      const { pendingBattleClosed } = useBattleStore.getState();
      if (pendingBattleClosed) {
        autoCloseTimerRef.current = setTimeout(() => {
          navigate(`/battles/${battleId}/result`);
        }, 5000);
      }
    };

    socket.on('battle:all:updated', handleTeamUpdateAll);

    return () => {
      socket.off('battle:all:updated', handleTeamUpdateAll);
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [socket, battleId, setTeamCounts, setIsTeamVoteResultShowing, navigate]);

  const closeModal = () => {
    setIsModalOpen(false);
    setVoteResult(null);
    setIsTeamVoteResultShowing(false); // 모달 닫힘 플래그 OFF

    // 타이머가 있으면 취소하고 즉시 이동
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }

    const { pendingBattleClosed } = useBattleStore.getState();
    if (pendingBattleClosed) {
      setPendingBattleClosed(false);
      navigate(`/battles/${battleId}/result`);
    }
  };

  return {
    voteResult,
    isModalOpen,
    closeModal
  };
}
