import type { BattlePhaseName, BattleTeam } from '@cmc/types';

export const isMyTeamAttacking = (team: BattleTeam, phase?: BattlePhaseName): boolean => {
  if (!phase) return false;
  return phase === 'ATTACK' && team !== 'NONE';
};

export const isInputDisabled = (team: BattleTeam, phase?: BattlePhaseName, disabled = false): boolean => {
  if (disabled) return true;
  if (!phase) return true;

  // 공격/방어 페이즈가 아니면 입력 불가
  if (phase !== 'ATTACK' && phase !== 'DEFENSE') return true;
  if (team === 'NONE') return true;

  return false;
};

export const getDiscussionConfig = (phase?: BattlePhaseName) => {
  if (phase === 'ATTACK') {
    return {
      label: '이의제기',
      placeholderText: '상대 코드의 허점을 찾아 이의 제기하세요',
      buttonText: '이의제기',
      isAttacking: true,
      isActive: true,
      colors: {
        iconBox: 'bg-red-500/20 border-red-500/40',
        icon: 'text-red-400',
        border: 'border-red-500/30',
        glowBorder: 'border-red-500',
        focusBorder: 'border-red-500',
        focusRing: 'focus:ring-red-500/30',
        bg: 'bg-gradient-to-r from-black/50 to-red-900/30',
        badge: 'bg-red-500/20 border-red-500/40 text-red-400',
        button: 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25 text-white'
      }
    };
  }

  if (phase === 'DEFENSE') {
    return {
      label: '반론',
      placeholderText: '상대 주장에 논리적으로 반박해 보세요',
      buttonText: '반론',
      isAttacking: false,
      isActive: true,
      colors: {
        iconBox: 'bg-blue-500/20 border-blue-500/40',
        icon: 'text-blue-400',
        border: 'border-blue-500/30',
        glowBorder: 'border-blue-500',
        focusBorder: 'border-blue-500',
        focusRing: 'focus:ring-blue-500/30',
        bg: 'bg-gradient-to-r ffrom-black/50 to-blue-900/30',
        badge: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
        button: 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 text-white'
      }
    };
  }

  return {
    label: '',
    placeholderText: '',
    buttonText: '',
    isAttacking: false,
    isActive: false,
    colors: {
      iconBox: '',
      icon: '',
      border: '',
      focusBorder: '',
      focusRing: '',
      glowBorder: '',
      bg: '',
      badge: '',
      button: ''
    }
  };
};
