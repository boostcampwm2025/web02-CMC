import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBattleStore } from '../stores/battleStore';
import { useBattleSocket } from './useBattleSocket';
import { useBattleSocketErrorHandling } from './useBattleSocketErrorHandling';
import { useBattleProgress } from './useBattleProgress';
import { useBattleDiscussions } from './useBattleDiscussions';
import { useBattleTimeline } from './useBattleTimeline';
import { useBattleTeam } from './useBattleTeam';
import { useAuthStore } from '@/commons/stores/authStore';
import useModal from '@/commons/hooks/useModal';

interface UseBattle {
  battleId?: string;
}

export function useBattle({ battleId }: UseBattle) {
  const location = useLocation();
  const selectedTeamFromState = (location.state as { selectedTeam?: 'A' | 'B' | 'NONE' })?.selectedTeam;
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!battleId || !user) return;
    let teamToSet: 'A' | 'B' | 'NONE' = 'NONE';

    if (user.type === 'guest' && user.selectedTeam) {
      teamToSet = user.selectedTeam;
    } else if (selectedTeamFromState) {
      teamToSet = selectedTeamFromState;
    }

    if (teamToSet !== 'NONE') {
      useBattleStore.getState().setSelectedTeam(teamToSet);
    }

    useBattleStore.getState().initializeBattle({
      userId: user.id,
      battleId
    });
  }, [battleId, selectedTeamFromState, user]);

  const {
    isOpen: isTeamChangeModalOpen,
    openModal: openTeamChangeModal,
    closeModal: closeTeamChangeModal
  } = useModal(false);

  useBattleSocket();
  useBattleSocketErrorHandling();

  const { handleVote, handleDiscussionSubmit } = useBattleDiscussions();
  const { roundModal, hideRoundEffect } = useBattleProgress();
  const { effectModal, hideEffect } = useBattleTimeline();
  const { handleTeamChange } = useBattleTeam({
    onOpenTeamChangeModal: openTeamChangeModal,
    onCloseTeamChangeModal: closeTeamChangeModal
  });

  return {
    handleVote,
    handleDiscussionSubmit,
    roundModal,
    effectModal,
    hideEffect,
    hideRoundEffect,
    handleTeamChange,
    isTeamChangeModalOpen,
    closeTeamChangeModal
  };
}
