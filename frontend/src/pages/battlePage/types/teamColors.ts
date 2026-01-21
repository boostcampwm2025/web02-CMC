import type { BattleTeam } from '@cmc/types';

export type Team = BattleTeam;

export interface TeamColors {
  primary: string;
  border: string;
  primaryBg: string;
  containerGradient: string;
  buttonHover: string;
  buttonActive: string;
  badgeGradient: string;
  codeBlock: string;
  codeText: string;
}

export const TEAM_COLORS: Record<Team, TeamColors> = {
  A: {
    primary: 'text-[#6BA3FF]',
    border: 'border-[#3B6FA8]',
    primaryBg: 'bg-[#3B6FA8]',
    containerGradient: 'from-[#1A2B4A] to-[#0F1A2E]',
    buttonHover: 'hover:bg-[#4B7FB8]',
    buttonActive: 'active:bg-[#2B5F98]',
    badgeGradient: 'from-[#1A2B4A] to-[#2B4A6E]',
    codeBlock: 'border-[#2B7FFF] bg-[#1C398E]',
    codeText: 'text-[#BEDBFF]'
  },
  B: {
    primary: 'text-[#FF7A7F]',
    border: 'border-[#C85A5F]',
    primaryBg: 'bg-[#C85A5F]',
    containerGradient: 'from-[#4A1F22] to-[#2F1214]',
    buttonHover: 'hover:bg-[#D86A6F]',
    buttonActive: 'active:bg-[#B84A4F]',
    badgeGradient: 'from-[#4A1F22] to-[#6A2F32]',
    codeBlock: 'border-[#FB2C36] bg-[#82181A]',
    codeText: 'text-[#FFC9C9]'
  },
  NONE: {
    primary: 'text-[#FF8533]',
    border: 'border-[#FF6900]',
    primaryBg: 'bg-[#F54900]',
    containerGradient: 'from-[#3A1F0F] to-[#241308]',
    buttonHover: 'hover:bg-[#FF5A00]',
    buttonActive: 'active:bg-[#E53900]',
    badgeGradient: 'from-[#CA3500] to-[#FF5A00]',
    codeBlock: 'border-[#FF6900] bg-[#CA3500]',
    codeText: 'text-[#FFB86A]'
  }
} as const;
