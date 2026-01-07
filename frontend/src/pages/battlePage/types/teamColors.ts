export type Team = 'A' | 'B';

export interface TeamColors {
  containerGradient: string;
  border: string;
  icon: string;
  inputBorder: string;
  buttonBg: string;
  buttonHover: string;
  buttonActive: string;
  badgeGradient: string;
  badgeIcon: string;
  hintText: string;
}

export const TEAM_COLORS: Record<Team, TeamColors> = {
  A: {
    containerGradient: 'from-[#1A2B4A] to-[#0F1A2E]',
    border: 'border-[#3B6FA8]',
    icon: 'text-[#6BA3FF]',
    inputBorder: 'border-[#3B6FA8]',
    buttonBg: 'bg-[#3B6FA8]',
    buttonHover: 'hover:bg-[#4B7FB8]',
    buttonActive: 'active:bg-[#2B5F98]',
    badgeGradient: 'from-[#1A2B4A] to-[#2B4A6E]',
    badgeIcon: 'text-[#6BA3FF]',
    hintText: 'text-[#6BA3FF]'
  },
  B: {
    containerGradient: 'from-[#4A1F22] to-[#2F1214]',
    border: 'border-[#C85A5F]',
    icon: 'text-[#FF7A7F]',
    inputBorder: 'border-[#C85A5F]',
    buttonBg: 'bg-[#C85A5F]',
    buttonHover: 'hover:bg-[#D86A6F]',
    buttonActive: 'active:bg-[#B84A4F]',
    badgeGradient: 'from-[#4A1F22] to-[#6A2F32]',
    badgeIcon: 'text-[#FF7A7F]',
    hintText: 'text-[#FF7A7F]'
  }
} as const;
