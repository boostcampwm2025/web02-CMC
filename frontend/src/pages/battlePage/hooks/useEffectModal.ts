import { useState, useCallback } from 'react';
import type { Team } from '@/commons/types/battle';

interface EffectModalState {
  isOpen: boolean;
  team: Team;
  content: string;
  type: 'attack' | 'defense';
}

export function useEffectModal() {
  const [effectModal, setEffectModal] = useState<EffectModalState>({
    isOpen: false,
    team: 'A',
    content: '',
    type: 'attack'
  });

  const showEffect = useCallback((team: Team, content: string, type: 'attack' | 'defense') => {
    setEffectModal({
      isOpen: true,
      team,
      content,
      type
    });
  }, []);

  const hideEffect = useCallback(() => {
    setEffectModal({
      isOpen: false,
      team: 'A',
      content: '',
      type: 'attack'
    });
  }, []);

  return {
    effectModal,
    showEffect,
    hideEffect
  };
}
