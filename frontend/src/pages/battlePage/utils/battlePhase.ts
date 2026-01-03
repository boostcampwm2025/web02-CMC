import type { BattlePhase, Team, TurnStatus } from '@/commons/types/battle';
import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';

export const isMyTeamAttacking = (team: Team, phase?: BattlePhase): boolean => {
  if (!phase) return false;
  return (team === 'A' && phase === 'TEAM_A_ATTACK') || (team === 'B' && phase === 'TEAM_B_ATTACK');
};

export const isInputDisabled = (
  team: Team,
  phase?: BattlePhase,
  turnStatus?: TurnStatus | null,
  disabled = false
): boolean => {
  if (disabled) return true;
  if (!phase) return true;

  // OPINION_SHARE, TEAM_SWITCH 단계에서는 무조건 비활성화
  if (phase === 'OPINION_SHARE' || phase === 'TEAM_SWITCH') return true;

  // 턴 정보가 없으면 비활성화
  if (!turnStatus) return true;

  // TEAM_A_ATTACK 페이즈
  if (phase === 'TEAM_A_ATTACK') {
    if (team === 'A') {
      // A팀: A_ATTACK 턴일 때만 이의제기 가능
      return turnStatus !== 'A_ATTACK';
    } else if (team === 'B') {
      // B팀: B_DEFENSE 턴일 때만 반론 가능
      return turnStatus !== 'B_DEFENSE';
    }
  }

  // TEAM_B_ATTACK 페이즈
  if (phase === 'TEAM_B_ATTACK') {
    if (team === 'B') {
      // B팀: B_ATTACK 턴일 때만 이의제기 가능
      return turnStatus !== 'B_ATTACK';
    } else if (team === 'A') {
      // A팀: A_DEFENSE 턴일 때만 반론 가능
      return turnStatus !== 'A_DEFENSE';
    }
  }

  return true;
};

export const getDiscussionConfig = (team: Team, phase?: BattlePhase) => {
  const isAttacking = isMyTeamAttacking(team, phase);

  return {
    placeholderText: isAttacking ? '상대 진영에 이의제기...' : '상대 진영에 반론...',
    buttonText: isAttacking ? '이의제기' : '반론',
    Icon: isAttacking ? BattleIcon : ShieldIcon,
    isAttacking
  };
};
