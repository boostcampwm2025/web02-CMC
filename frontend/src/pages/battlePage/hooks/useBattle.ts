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
  const selectedTeam = (location.state as { selectedTeam?: 'A' | 'B' | 'NONE' })?.selectedTeam;
  // 각 탭/브라우저별 고유 userId 생성 및 store 초기화
  useEffect(() => {
    if (!battleId) return;

    let userId = sessionStorage.getItem('testUserId');
    if (!userId) {
      userId = `user-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('testUserId', userId);
    }

    useBattleStore.getState().initializeBattle({
      userId,
      battleId
    });

    // selectedTeam이 있으면 설정
    if (selectedTeam) {
      useBattleStore.getState().setSelectedTeam(selectedTeam);
    }
  }, [battleId, selectedTeam]);

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
