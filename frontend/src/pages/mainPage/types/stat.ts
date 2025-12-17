import TimeLineIcon from '@/assets/icon/timeline.svg?react';
import PlusIcon from '@/assets/icon/plus.svg?react';
import BattleIcon from '@/assets/icon/battle.svg?react';

export type StatType = 'TOTAL_BATTLES' | 'LIVE_BATTLES' | 'TOTAL_USERS';

export const STAT_CONFIG: Record<
  StatType,
  {
    label: string;
    color: string;
    background: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }
> = {
  TOTAL_BATTLES: {
    label: '진행된 배틀',
    color: '#F97316',
    background: 'rgba(249, 115, 22, 0.15)',
    icon: TimeLineIcon
  },
  LIVE_BATTLES: {
    label: '실시간 배틀',
    color: '#FFD600',
    background: 'rgba(255, 214, 0, 0.15)',
    icon: PlusIcon
  },
  TOTAL_USERS: {
    label: '참여 개발자',
    color: '#F97316',
    background: 'rgba(249, 115, 22, 0.15)',
    icon: BattleIcon
  }
};
