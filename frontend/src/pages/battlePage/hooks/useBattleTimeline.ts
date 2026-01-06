import { useEffect } from 'react';
import type { BattleAttackedResult, BattleDefensedResult } from '@/commons/types/battle';
import { useBattleStore, selectBattleProgress, selectSocket } from '../stores/battleStore';
import { useEffectModal } from './useEffectModal';

export function useBattleTimeline() {
  const socket = useBattleStore(selectSocket);
  const battleProgress = useBattleStore(selectBattleProgress);
  const { effectModal, showEffect, hideEffect } = useEffectModal();

  useEffect(() => {
    if (!socket) return;

    const handleAttacked = (data: BattleAttackedResult) => {
      // 턴 상태로 공격하는 팀 판단
      const attackingTeam = battleProgress?.turn?.status === 'A_ATTACK' ? 'A' : 'B';
      showEffect(attackingTeam, data.attack.text, 'attack');
    };

    const handleDefensed = (data: BattleDefensedResult) => {
      // 턴 상태로 방어하는 팀 판단
      const defendingTeam = battleProgress?.turn?.status === 'A_DEFENSE' ? 'A' : 'B';
      showEffect(defendingTeam, data.defense.text, 'defense');
    };

    socket.on('battle:attacked', handleAttacked);
    socket.on('battle:defensed', handleDefensed);

    return () => {
      socket.off('battle:attacked', handleAttacked);
      socket.off('battle:defensed', handleDefensed);
    };
  }, [socket, battleProgress?.turn?.status, showEffect]);

  return { effectModal, hideEffect };
}
