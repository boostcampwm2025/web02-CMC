import { useEffect, useCallback } from 'react';
import {
  useBattleStore,
  selectBattleProgress,
  selectSelectedTeam,
  selectSocket,
  selectBattleId
} from '../stores/battleStore';
import type { BattleUserUpdateResponse } from '@/commons/types/battle';

interface UseBattleTeamProps {
  onOpenTeamChangeModal: () => void;
  onCloseTeamChangeModal: () => void;
}

export function useBattleTeam({ onOpenTeamChangeModal, onCloseTeamChangeModal }: UseBattleTeamProps) {
  const socket = useBattleStore(selectSocket);
  const battleId = useBattleStore(selectBattleId);
  const { setSelectedTeam, setTeamCounts } = useBattleStore();
  const battleProgress = useBattleStore(selectBattleProgress);
  const selectedTeam = useBattleStore(selectSelectedTeam);

  // TEAM_SWITCH 페이즈 시 모달 자동 열기
  useEffect(() => {
    if (battleProgress?.phase === 'TEAM_SWITCH') {
      const timer = setTimeout(() => {
        onOpenTeamChangeModal();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [battleProgress?.phase, onOpenTeamChangeModal]);

  // 팀 변경 이벤트 수신
  useEffect(() => {
    if (!socket) return;

    const handleChangedTeam = (data: { battleId: string; team: 'A' | 'B' | 'NONE' }) => {
      setSelectedTeam(data.team);
    };

    socket.on('battle:team:update', handleChangedTeam);

    return () => {
      socket.off('battle:team:update', handleChangedTeam);
    };
  }, [socket, setSelectedTeam]);

  // 새 참여자 입장 시 전체 인원 수 업데이트
  useEffect(() => {
    if (!socket) return;

    const handleUserUpdate = (data: BattleUserUpdateResponse) => {
      if (data.battleId !== battleId) return;

      setTeamCounts(
        {
          teamACount: data.counts.teamA,
          teamBCount: data.counts.teamB,
          none: data.counts.teamNone
        },
        data.totalCount
      );
    };

    socket.on('battle:user:update', handleUserUpdate);

    return () => {
      socket.off('battle:user:update', handleUserUpdate);
    };
  }, [socket, setTeamCounts]);

  // 팀 변경 요청
  const handleTeamChange = useCallback(
    (team: 'A' | 'B' | 'NONE') => {
      if (!socket) return;
      socket.emit('battle:team:vote', { battleId, team });

      onCloseTeamChangeModal();
    },
    [socket, battleId, onCloseTeamChangeModal]
  );

  return { selectedTeam, handleTeamChange };
}
