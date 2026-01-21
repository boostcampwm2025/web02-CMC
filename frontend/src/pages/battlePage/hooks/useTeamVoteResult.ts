import { useEffect, useState } from 'react';
import { useBattleStore, selectSocket, selectBattleId } from '../stores/battleStore';
import type { BattleTeamUpdateAllResponse } from '@cmc/types';

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
        teamA: data.after.teamA,
        teamB: data.after.teamB,
        none: data.after.none
      });

      // 모달용 전체 데이터 저장
      setVoteResult(data);
      setIsModalOpen(true);
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
