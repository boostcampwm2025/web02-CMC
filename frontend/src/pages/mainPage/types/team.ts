export type BattleTeam = 'A' | 'B' | 'DRAW';

export const TEAM_STYLE: Record<
  BattleTeam,
  {
    color: string;
    background: string;
    label: string;
  }
> = {
  A: {
    color: '#2B7FFF',
    background: 'rgba(43, 127, 255, 0.15)',
    label: 'A 승리'
  },
  B: {
    color: '#FB2C36',
    background: 'rgba(251, 44, 54, 0.15)',
    label: 'B 승리'
  },
  DRAW: {
    color: '#9CA3AF',
    background: 'rgba(156, 163, 175, 0.15)',
    label: '무승부'
  }
};
