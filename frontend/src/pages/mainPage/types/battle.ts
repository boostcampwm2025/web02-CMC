import type { BattleStatus, BattleResult } from '@cmc/types';

export type BattleCategory = 'ALGORITHM' | 'REFACTORING' | 'IMPLEMENTATION' | 'ETC';
export type WinnerTeam = 'A' | 'B' | 'DRAW';

import TrophyIcon from '@/assets/icon/trophy.svg?react';
import CrownIcon from '@/assets/icon/crown.svg?react';
import BattleIcon from '@/assets/icon/battle.svg?react';

export const BATTLE_CATEGORY_CONFIG: Record<
  BattleCategory,
  {
    key: BattleCategory;
    title: string;
    description: string;
    text: string; // 아이콘 / 텍스트 컬러
    bg: string; // 상단 바 / 강조 컬러
    bgSoft: string; // IconBox 배경
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
> = {
  ALGORITHM: {
    key: 'ALGORITHM',
    title: '⚡ 알고리즘 배틀',
    description: '성능과 효율성을 겨루는 알고리즘 대결',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400',
    bgSoft: 'bg-yellow-400/15',
    icon: TrophyIcon
  },

  REFACTORING: {
    key: 'REFACTORING',
    title: '🎨 리팩토링 배틀',
    description: '클린 코드 vs 실용성의 대결',
    text: 'text-emerald-400',
    bg: 'bg-emerald-400',
    bgSoft: 'bg-emerald-400/15',
    icon: BattleIcon
  },

  IMPLEMENTATION: {
    key: 'IMPLEMENTATION',
    title: '💡 구현 배틀',
    description: '같은 기능, 다른 접근법의 대결',
    text: 'text-orange-400',
    bg: 'bg-orange-400',
    bgSoft: 'bg-orange-400/15',
    icon: CrownIcon
  },

  ETC: {
    key: 'ETC',
    title: '📦 기타 배틀',
    description: '기타 주제의 배틀',
    text: 'text-gray-400',
    bg: 'bg-gray-400',
    bgSoft: 'bg-gray-400/15',
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
}

export interface ClosedBattleItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'CLOSED';
  createdAt: string;
  expiresAt: string;
  result: BattleResult;
}
