export type BattleCategory = 'algorithm' | 'refactoring' | 'implementation' | 'etc';

export type BattleStatus = 'LIVE' | 'FINISHED';
export type WinnerTeam = 'A' | 'B' | 'DRAW';

export const CATEGORY_COLORS: Record<
  BattleCategory,
  { primary: string; background: string; icon: 'trophy' | 'crown' }
> = {
  implementation: {
    primary: '#F97316', // 주황색
    background: 'rgba(255, 214, 0, 0.15)',
    icon: 'crown'
  },
  algorithm: {
    primary: '#FFD600', // 노란색
    background: 'rgba(249, 115, 22, 0.15)',
    icon: 'trophy'
  },
  refactoring: {
    primary: '#28C76F', // 초록색
    background: 'rgba(40, 199, 111, 0.1)',
    icon: 'crown'
  },
  etc: {
    primary: '#6B7280', // 회색
    background: 'rgba(155, 89, 182, 0.1)',
    icon: 'crown'
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
  timeLabel: string; // createdAt/expiresAt로부터 계산된 값

  // 과거 배틀용 필드
  winner?: WinnerTeam;
  aPct?: number;
  bPct?: number;
}
