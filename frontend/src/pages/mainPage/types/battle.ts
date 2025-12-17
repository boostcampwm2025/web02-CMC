export type BattleCategory = 'ALGORITHM' | 'REFACTORING' | 'IMPLEMENTATION' | 'ETC';

export type BattleStatus = 'OPEN' | 'CLOSED';
export type WinnerTeam = 'A' | 'B';

import TrophyIcon from '@/assets/icon/trophy.svg?react';
import CrownIcon from '@/assets/icon/crown.svg?react';
import BattleIcon from '@/assets/icon/battle.svg?react';

export const BATTLE_CATEGORY_CONFIG: Record<
  BattleCategory,
  {
    color: string;
    background: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }
> = {
  IMPLEMENTATION: {
    color: '#F97316',
    background: 'rgba(249, 115, 22, 0.15)',
    icon: CrownIcon
  },
  ALGORITHM: {
    color: '#FFD600',
    background: 'rgba(255, 214, 0, 0.15)',
    icon: TrophyIcon
  },
  REFACTORING: {
    color: '#28C76F',
    background: 'rgba(40, 199, 111, 0.1)',
    icon: BattleIcon
  },
  ETC: {
    color: '#6B7280',
    background: 'rgba(155, 89, 182, 0.1)',
    icon: BattleIcon
  }
};

export interface BattleCardItem {
  id: string;
  title: string;
  description: string;
  status: BattleStatus;
  createdAt: Date;
  expiresAt: Date;
  clientCount: number;

  // 추가 필드 (카드 표시용)
  category: BattleCategory;
  timeLabel: string;

  // 과거 배틀용 필드
  winner?: WinnerTeam;
  aPct?: number;
  bPct?: number;
}
