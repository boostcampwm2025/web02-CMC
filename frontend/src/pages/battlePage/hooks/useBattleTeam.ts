import { useEffect, useCallback } from 'react';
import {
  useBattleStore,
  selectBattleProgress,
  selectSelectedTeam,
  selectSocket,
  selectBattleId,
  selectTeamCounts
} from '../stores/battleStore';
import type { BattleUserUpdateResponse, BattleTeamUpdatedResponse } from '@cmc/types';

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
  const teamCounts = useBattleStore(selectTeamCounts);

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

    const handleChangedTeam = (data: BattleTeamUpdatedResponse) => {
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

    const handleUserUpdate = ({ counts, battleId, totalCount }: BattleUserUpdateResponse) => {
      if (battleId !== battleId) return;
      const { teamA, teamB, none } = counts;

      setTeamCounts({ teamA, teamB, none }, totalCount);
    };

    socket.on('battle:user:updated', handleUserUpdate);

    return () => {
      socket.off('battle:user:updated', handleUserUpdate);
    };
  }, [socket, battleId, setTeamCounts]);

  // 팀 변경 요청
  const handleTeamChange = useCallback(
    (team: 'A' | 'B' | 'NONE') => {
      if (!socket) return;
      setSelectedTeam(team);

      // 낙관적 업데이트: 인원수 변경
      const newCounts = { ...teamCounts };

      // 이전 팀에서 -1
      if (selectedTeam === 'A') newCounts.teamA = Math.max(0, newCounts.teamA - 1);
      else if (selectedTeam === 'B') newCounts.teamB = Math.max(0, newCounts.teamB - 1);
      else newCounts.none = Math.max(0, newCounts.none - 1);

      // 새 팀에 +1
      if (team === 'A') newCounts.teamA++;
      else if (team === 'B') newCounts.teamB++;
      else newCounts.none++;

      setTeamCounts(newCounts);

      // 서버에 전송
      socket.emit('battle:team:vote', { battleId, team });

      onCloseTeamChangeModal();
    },
    [socket, battleId, selectedTeam, teamCounts, setSelectedTeam, setTeamCounts, onCloseTeamChangeModal]
  );

  return { selectedTeam, handleTeamChange };
}
