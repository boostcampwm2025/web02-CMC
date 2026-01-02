import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useBattleStore, selectBattleProgress, selectSelectedTeam } from '../stores/battleStore';

interface UseBattleTeamProps {
  socket: Socket | null;
  battleId: string;
  onOpenTeamChangeModal: () => void;
  onCloseTeamChangeModal: () => void;
}

export function useBattleTeam({ socket, battleId, onOpenTeamChangeModal, onCloseTeamChangeModal }: UseBattleTeamProps) {
  const { setSelectedTeam } = useBattleStore();
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

  // 팀 변경 요청
  const handleTeamChange = useCallback(
    (team: 'A' | 'B' | 'NONE') => {
      if (!socket) return;
      socket.emit('battle:teamVote', { battleId, team });

      onCloseTeamChangeModal();
    },
    [socket, battleId, onCloseTeamChangeModal]
  );

  return { selectedTeam, handleTeamChange };
}
