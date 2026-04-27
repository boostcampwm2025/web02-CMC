import type { IconName } from '@/commons/components/Icon';
import type { BattlePhaseName } from '@/commons/types/battle';

export interface PhaseConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: IconName;
}

export const PHASE_CONFIG: Record<BattlePhaseName, PhaseConfig> = {
  PENDING: {
    label: '대기 중',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/50',
    icon: 'clock'
  },
  OPINION_SHARE: {
    label: '의견 공유',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    icon: 'message'
  },
  ATTACK: {
    label: '이의제기',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    icon: 'battle'
  },
  DEFENSE: {
    label: '반박',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    icon: 'shield'
  },
  TEAM_SWITCH: {
    label: '진영 변경',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    icon: 'shuffle'
  }
};
