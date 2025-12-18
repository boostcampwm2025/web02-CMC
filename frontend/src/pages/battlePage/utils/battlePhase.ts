import type { BattlePhase, Team } from '@/commons/types/battle';
import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';

export const isMyTeamAttacking = (team: Team, phase?: BattlePhase): boolean => {
  if (!phase) return false;
  return (team === 'A' && phase === 'TEAM_A_ATTACK') || (team === 'B' && phase === 'TEAM_B_ATTACK');
};

export const isInputDisabled = (phase?: BattlePhase, disabled = false): boolean => {
  if (disabled) return true;
  if (!phase) return true;
  return phase === 'OPINION_SHARE' || phase === 'TEAM_SWITCH';
};

export const getObjectionConfig = (team: Team, phase?: BattlePhase) => {
  const isAttacking = isMyTeamAttacking(team, phase);

  return {
    placeholderText: isAttacking ? '상대 진영에 이의제기...' : '상대 진영에 반론...',
    buttonText: isAttacking ? '이의제기' : '반론',
    Icon: isAttacking ? BattleIcon : ShieldIcon,
    isAttacking
  };
};
