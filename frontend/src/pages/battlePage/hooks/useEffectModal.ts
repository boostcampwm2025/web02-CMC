import { useState, useCallback } from 'react';
import type { Team } from '@/commons/types/battle';

interface EffectModalState {
  isOpen: boolean;
  team: Team;
  content: string;
}

export function useEffectModal() {
  const [effectModal, setEffectModal] = useState<EffectModalState>({
    isOpen: false,
    team: 'A',
    content: ''
  });

  const showEffect = useCallback((team: Team, content: string) => {
    setEffectModal({
      isOpen: true,
      team,
      content
    });
  }, []);

  const hideEffect = useCallback(() => {
    setEffectModal({
      isOpen: false,
      team: 'A',
      content: ''
    });
  }, []);

  return {
    effectModal,
    showEffect,
    hideEffect
  };
}
