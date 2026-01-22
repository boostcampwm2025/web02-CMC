import { useEffect, useState } from 'react';
import { useBattleStore, selectSocket, selectBattleId } from '../stores/battleStore';
import type { BattleTeamUpdateAllResponse } from '@/commons/types/battle';
import { soundManager } from '@/commons/utils/soundManager';

export function useTeamVoteResult() {
  const socket = useBattleStore(selectSocket);
  const battleId = useBattleStore(selectBattleId);
  const { setTeamCounts } = useBattleStore();

  const [voteResult, setVoteResult] = useState<BattleTeamUpdateAllResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      // 팀 투표 결과 효과음 재생
      soundManager.play('fanfare', 0.5);
    };

    socket.on('battle:all:updated', handleTeamUpdateAll);

    return () => {
      socket.off('battle:all:updated', handleTeamUpdateAll);
    };
  }, [socket, battleId, setTeamCounts]);

  const closeModal = () => {
    setIsModalOpen(false);
    setVoteResult(null);
  };

  return {
    voteResult,
    isModalOpen,
    closeModal
  };
}
