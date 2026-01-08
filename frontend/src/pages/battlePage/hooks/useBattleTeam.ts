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

  useEffect(() => {
    if (!socket) return;

    const handleChangedTeam = (data: { battleId: string; team: 'A' | 'B' | 'NONE' }) => {
      if (data.battleId !== battleId) return;

      setSelectedTeam(data.team);
    };

    socket.on('battle:team:updated', handleChangedTeam);

    return () => {
      socket.off('battle:team:updated', handleChangedTeam);
    };
  }, [socket, battleId, setSelectedTeam]);

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

    socket.on('battle:user:updated', handleUserUpdate);

    return () => {
      socket.off('battle:user:updated', handleUserUpdate);
    };
  }, [socket, setTeamCounts]);

  // 팀 변경 요청
  const handleTeamChange = useCallback(
    (team: 'A' | 'B' | 'NONE') => {
      if (!socket) return;

      // 낙관적 업데이트: 즉시 UI 반영
      setSelectedTeam(team);

      // 서버에 전송
      socket.emit('battle:team:vote', { battleId, team });

      onCloseTeamChangeModal();
    },
    [socket, battleId, setSelectedTeam, onCloseTeamChangeModal]
  );

  return { selectedTeam, handleTeamChange };
}
