export type BattleTeam = 'A' | 'B' | 'DRAW';

export const TEAM_STYLE = {
  A: {
    label: 'A 승리',
    text: 'text-blue-400',
    bg: 'bg-blue-400',
    bgSoft: 'bg-blue-400/10'
  },
  B: {
    label: 'B 승리',
    text: 'text-red-400',
    bg: 'bg-red-400',
    bgSoft: 'bg-red-400/10'
  },
  DRAW: {
    label: '무승부',
    text: 'text-gray-400',
    bg: 'bg-gray-400',
    bgSoft: 'bg-gray-400/10'
  }
} as const;
