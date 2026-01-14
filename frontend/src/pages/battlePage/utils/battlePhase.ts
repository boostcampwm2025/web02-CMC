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

export const getDiscussionConfig = (phase?: BattlePhase) => {
  if (phase === 'ATTACK') {
    return {
      label: '공격',
      placeholderText: '상대 진영의 코드와 주장에 이의제기를 던지세요...',
      buttonText: '이의제기하기',
      Icon: BattleIcon,
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
      label: '방어',
      placeholderText: '상대 진영의 이의제기에 반박하세요...',
      buttonText: '반론하기',
      Icon: ShieldIcon,
      isAttacking: false,
      isActive: true,
      colors: {
        iconBox: 'bg-blue-500/20 border-blue-500/40',
        icon: 'text-blue-400',
        border: 'border-blue-500/30',
        glowBorder: 'border-blue-500',
        focusBorder: 'border-blue-500',
        focusRing: 'focus:ring-blue-500/30',
        bg: 'bg-gradient-to-r from-blue-950/50 to-blue-900/30',
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
    Icon: null,
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
