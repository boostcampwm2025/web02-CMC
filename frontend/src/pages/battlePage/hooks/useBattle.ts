import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBattleStore } from '../stores/battleStore';
import { useBattleSocket } from './useBattleSocket';
import { useBattleProgress } from './useBattleProgress';
import { useBattleDiscussions } from './useBattleDiscussions';
import { useBattleTimeline } from './useBattleTimeline';
import { useBattleTeam } from './useBattleTeam';

interface UseBattle {
  battleId?: string;
  onOpenTeamChangeModal: () => void;
  onCloseTeamChangeModal: () => void;
}

export function useBattle({ battleId, onOpenTeamChangeModal, onCloseTeamChangeModal }: UseBattle) {
  const location = useLocation();
  const selectedTeamFromState = (location.state as { selectedTeam?: 'A' | 'B' | 'NONE' })?.selectedTeam;

  // 배틀 초기화 (selectedTeam 먼저 설정)
  useEffect(() => {
    if (!battleId) return;

    let userId = sessionStorage.getItem('testUserId');
    if (!userId) {
      userId = `user-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('testUserId', userId);
    }

    // selectedTeam을 먼저 설정
    if (selectedTeamFromState) {
      useBattleStore.getState().setSelectedTeam(selectedTeamFromState);
    }

    useBattleStore.getState().initializeBattle({
      userId,
      battleId
    });
  }, [battleId, selectedTeamFromState]);

  // 모든 배틀 관련 훅 초기화
  useBattleSocket();
  useBattleProgress();

  const { handleVote, handleDiscussionSubmit } = useBattleDiscussions();
  const { effectModal, hideEffect } = useBattleTimeline();
  const { handleTeamChange } = useBattleTeam({
    onOpenTeamChangeModal,
    onCloseTeamChangeModal
  });

  return {
    handleVote,
    handleDiscussionSubmit,
    effectModal,
    hideEffect,
    handleTeamChange
  };
}
