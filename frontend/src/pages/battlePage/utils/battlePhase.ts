import type { BattlePhase, Team } from '@/commons/types/battle';

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

export const getDiscussionConfig = (phase?: BattlePhase) => {
  if (phase === 'ATTACK') {
    return {
      placeholderText: '상대 진영의 코드와 주장에 이의제기를 던지세요...',
      buttonText: '이의제기하기',
      isAttacking: true,
      isActive: true
    };
  }

  if (phase === 'DEFENSE') {
    return {
      placeholderText: '상대 진영의 이의제기에 반박하세요...',
      buttonText: '반론하기',
      isAttacking: false,
      isActive: true
    };
  }

  // ATTACK/DEFENSE가 아닌 경우 (사용되지 않지만 타입 안정성을 위해)
  return {
    placeholderText: '',
    buttonText: '',
    isAttacking: false,
    isActive: false
  };
};
