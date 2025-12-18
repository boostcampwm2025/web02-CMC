import TimeLineIcon from '@/assets/icon/timeline.svg?react';
import PlusIcon from '@/assets/icon/plus.svg?react';
import BattleIcon from '@/assets/icon/battle.svg?react';

export type StatType = 'TOTAL_BATTLES' | 'LIVE_BATTLES' | 'TOTAL_USERS';

export const STAT_CONFIG: Record<
  StatType,
  {
    label: string;
    text: string;
    bg: string;
    bgSoft: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
> = {
  TOTAL_BATTLES: {
    label: '진행된 배틀',
    text: 'text-orange-400',
    bg: 'bg-orange-400',
    bgSoft: 'bg-orange-400/15',
    icon: TimeLineIcon
  },

  LIVE_BATTLES: {
    label: '실시간 배틀',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400',
    bgSoft: 'bg-yellow-400/15',
    icon: PlusIcon
  },

  TOTAL_USERS: {
    label: '참여 개발자',
    text: 'text-emerald-400',
    bg: 'bg-emerald-400',
    bgSoft: 'bg-emerald-400/15',
    icon: BattleIcon
  }
};
