import { useEffect } from 'react';
import type { BattleInfo } from '@/commons/types/battle';
import { useBattleStore } from '@/pages/battlePage/stores/battleStore';
import { useAuthStore } from '@/commons/stores/authStore';
import { createMockSocket } from '@/pages/tutorial/utils/mockSocket';
import {
  TUTORIAL_BATTLE_ID,
  TUTORIAL_BATTLE_PROGRESS,
  TUTORIAL_TEAM_COUNTS,
  TUTORIAL_TEAM_CHATS,
  TUTORIAL_ALL_CHATS,
  TUTORIAL_USER
} from '@/pages/tutorial/const/tutorialBattle';
import { MOCK_DISCUSSIONS } from '@/pages/battlePage/components/tutorial/const/tutorialSteps';

interface TutorialBattleSetupOptions {
  battleInfo: BattleInfo;
  selectedTeamFromState?: 'A' | 'B' | 'NONE';
}

export function useTutorialBattleSetup({ battleInfo, selectedTeamFromState }: TutorialBattleSetupOptions) {
  useEffect(() => {
    const previousUser = useAuthStore.getState().user;
    const shouldRestoreUser = !previousUser;
    const activeUser = previousUser ?? TUTORIAL_USER;

    if (!previousUser) {
      useAuthStore.setState({ user: activeUser });
    }

    const store = useBattleStore.getState();
    store.initializeBattle({ userId: activeUser.id, battleId: TUTORIAL_BATTLE_ID });
    store.setSelectedTeam(selectedTeamFromState ?? 'NONE');
    store.setBattleProgress(TUTORIAL_BATTLE_PROGRESS);
    store.setCurrentStage(TUTORIAL_BATTLE_PROGRESS.phase);
    store.setTeamCounts(TUTORIAL_TEAM_COUNTS);
    store.setTimelines(battleInfo.timelines);
    store.setDiscussions(MOCK_DISCUSSIONS);
    store.setTeamChats(TUTORIAL_TEAM_CHATS);
    store.setAllChats(TUTORIAL_ALL_CHATS);
    store.setChatInitialized(true);
    store.setSocket(createMockSocket());

    return () => {
      useBattleStore.getState().leaveBattle();
      if (shouldRestoreUser) {
        useAuthStore.setState({ user: null });
      }
    };
  }, [battleInfo.timelines, selectedTeamFromState]);
}
