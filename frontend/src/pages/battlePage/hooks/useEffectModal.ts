import { useState, useCallback } from 'react';
import type { BattleTeam } from '@/commons/types/battle';
import { soundManager } from '@/commons/utils/soundManager';

export interface EffectModalState {
  isOpen: boolean;
  team: BattleTeam;
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

  const showEffect = useCallback((team: BattleTeam, content: string, type: 'attack' | 'defense') => {
    setEffectModal({
      isOpen: true,
      team,
      content,
      type
    });
    soundManager.play('swordSlash');
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
