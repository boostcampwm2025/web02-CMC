import { useNavigate } from 'react-router-dom';
import { selectIsOAuth, selectUser, useAuthStore } from '@/commons/stores/authStore';
import { useBattleStore } from '@/features/battle/stores/battleStore';
import type { BattleTeam } from '@/commons/types/battle';

interface UseTeamSelectSubmitOptions {
  battleId: string;
  selectedTeam: BattleTeam | null;
}

export function useTeamSelectSubmit({ battleId, selectedTeam }: UseTeamSelectSubmitOptions) {
  const navigate = useNavigate();
  const loginGuest = useAuthStore((s) => s.loginGuest);
  const user = useAuthStore(selectUser);
  const isOAuth = useAuthStore(selectIsOAuth);

  const enterBattle = (userId: string) => {
    useBattleStore.getState().initializeBattle({ userId, battleId });
    useBattleStore.getState().setSelectedTeam(selectedTeam!);
    navigate(`/battle/${battleId}`, { state: { selectedTeam } });
  };

  const handleSubmit = async () => {
    if (!selectedTeam || !battleId) return;

    if (user && isOAuth) {
      enterBattle(user.id);
      return;
    }

    try {
      const guestUser = await loginGuest(battleId, selectedTeam !== 'NONE' ? selectedTeam : undefined);
      enterBattle(guestUser.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : '로그인에 실패했습니다.');
    }
  };

  return { handleSubmit };
}
