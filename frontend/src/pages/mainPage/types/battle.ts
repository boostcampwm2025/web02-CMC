export type BattleCategory = 'ALGORITHM' | 'REFACTORING' | 'IMPLEMENTATION' | 'ETC';

export type BattleStatus = 'OPEN' | 'CLOSED';
export type WinnerTeam = 'A' | 'B';

import TrophyIcon from '@/assets/icon/trophy.svg?react';
import CrownIcon from '@/assets/icon/crown.svg?react';
import BattleIcon from '@/assets/icon/battle.svg?react';

export const BATTLE_CATEGORY_CONFIG: Record<
  BattleCategory,
  {
    key: BattleCategory;
    title: string;
    description: string;
    color: string;
    background: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }
> = {
  ALGORITHM: {
    key: 'ALGORITHM',
    title: '⚡ 알고리즘 배틀',
    description: '성능과 효율성을 겨루는 알고리즘 대결',
    color: '#FFD600',
    background: 'rgba(255, 214, 0, 0.15)',
    icon: TrophyIcon
  },
  REFACTORING: {
    key: 'REFACTORING',
    title: '🎨 리팩토링 배틀',
    description: '클린 코드 vs 실용성의 대결',
    color: '#28C76F',
    background: 'rgba(40, 199, 111, 0.1)',
    icon: BattleIcon
  },
  IMPLEMENTATION: {
    key: 'IMPLEMENTATION',
    title: '💡 구현 배틀',
    description: '같은 기능, 다른 접근법의 대결',
    color: '#F97316',
    background: 'rgba(249, 115, 22, 0.15)',
    icon: CrownIcon
  },
  ETC: {
    key: 'ETC',
    title: '📦 기타 배틀',
    description: '기타 주제의 배틀',
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
