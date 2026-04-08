import { useNavigate } from 'react-router-dom';
import { selectIsOAuth, selectUser, useAuthStore } from '@/commons/stores/authStore';
import { useBattleStore } from '@/pages/battlePage/stores/battleStore';
import type { Team } from '@/commons/types/battle';

interface UseTeamSelectSubmitOptions {
  battleId: string;
  selectedTeam: Team | null;
}

export function useTeamSelectSubmit({ battleId, selectedTeam }: UseTeamSelectSubmitOptions) {
  const navigate = useNavigate();
  const loginGuest = useAuthStore((s) => s.loginGuest);
  const user = useAuthStore(selectUser);
  const isOAuth = useAuthStore(selectIsOAuth);

  const handleSubmit = async () => {
    if (!selectedTeam || !battleId) return;

    // OAuth 사용자는 바로 배틀 페이지로 이동
    if (user && isOAuth) {
      useBattleStore.getState().initializeBattle({ userId: user.id, battleId });
      useBattleStore.getState().setSelectedTeam(selectedTeam);
      navigate(`/battle/${battleId}`, { state: { selectedTeam } });
      return;
    }

    // 비회원이거나 로그인 안 된 경우 서버에서 랜덤 닉네임 생성 후 로그인
    try {
      const guestUser = await loginGuest(battleId, selectedTeam !== 'NONE' ? selectedTeam : undefined);
      useBattleStore.getState().initializeBattle({ userId: guestUser.id, battleId });
      useBattleStore.getState().setSelectedTeam(selectedTeam);
      navigate(`/battle/${battleId}`, { state: { selectedTeam } });
    } catch (e) {
      alert(e instanceof Error ? e.message : '로그인에 실패했습니다.');
    }
  };

  return { handleSubmit };
}
