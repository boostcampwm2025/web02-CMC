import type { IconName } from '@/commons/components/Icon';

export type StatType = 'TOTAL_BATTLES' | 'LIVE_BATTLES' | 'TOTAL_USERS';

export const STAT_CONFIG: Record<
  StatType,
  {
    label: string;
    text: string;
    bg: string;
    bgSoft: string;
    icon: IconName;
  }
> = {
  TOTAL_BATTLES: {
    label: '진행된 배틀',
    text: 'text-orange-400',
    bg: 'bg-orange-400',
    bgSoft: 'bg-orange-400/15',
    icon: 'timeline'
  },

  LIVE_BATTLES: {
    label: '실시간 배틀',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400',
    bgSoft: 'bg-yellow-400/15',
    icon: 'plus'
  },

  TOTAL_USERS: {
    label: '참여 개발자',
    text: 'text-emerald-400',
    bg: 'bg-emerald-400',
    bgSoft: 'bg-emerald-400/15',
    icon: 'battle'
  }
};
