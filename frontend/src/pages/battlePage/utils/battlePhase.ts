import type { BattlePhase, Team } from '@/commons/types/battle';
import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';

export const isMyTeamAttacking = (team: Team, phase?: BattlePhase): boolean => {
  if (!phase) return false;
  return phase === 'ATTACK' && team !== 'NONE';
};

export const isInputDisabled = (team: Team, phase?: BattlePhase, disabled = false): boolean => {
  if (disabled) return true;
  if (!phase) return true;

  // 공격/방어 페이즈가 아니면 입력 불가
  if (phase !== 'ATTACK' && phase !== 'DEFENSE') return true;
  if (team === 'NONE') return true;

  return false;
};

export const getDiscussionConfig = (team: Team, phase?: BattlePhase) => {
  const isAttacking = isMyTeamAttacking(team, phase) || phase === 'ATTACK';

  return {
    placeholderText:
      phase === 'OPINION_SHARE'
        ? '의견을 공유하세요...'
        : isAttacking
          ? '상대 진영에 이의제기...'
          : '상대 진영에 반론...',
    buttonText: isAttacking ? '이의제기' : '반론',
    Icon: isAttacking ? BattleIcon : ShieldIcon,
    isAttacking
  };
};
