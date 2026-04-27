import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '@/commons/utils/soundManager';
import { useBattleStore } from '@/features/battle/stores/battleStore';
import { selectUser, useAuthStore } from '@/commons/stores/authStore';

export function useBattleLeave() {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const leaveBattle = useBattleStore((s) => s.leaveBattle);
  const hasLeftRef = useRef(false);

  const safeLeaveBattle = useCallback(() => {
    if (hasLeftRef.current) return;
    hasLeftRef.current = true;
    leaveBattle();
  }, [leaveBattle]);

  useEffect(() => {
    const handlePageHide = () => {
      soundManager.stopAllBGM();
      safeLeaveBattle();
    };

    const handleBeforeUnload = () => {
      soundManager.stopAllBGM();
      safeLeaveBattle();
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      soundManager.stopAllBGM();
      safeLeaveBattle();
    };
  }, [safeLeaveBattle]);

  const handleLeaveBattle = useCallback(() => {
    if (!user) return;
    navigate('/main');
    safeLeaveBattle();
  }, [user, navigate, safeLeaveBattle]);

  return { handleLeaveBattle };
}
