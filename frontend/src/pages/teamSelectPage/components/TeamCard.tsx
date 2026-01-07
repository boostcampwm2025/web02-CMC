import type { Team } from '../types/teamSelect';
import Sheild from '@/assets/icon/shield.svg?react';
import Scale from '@/assets/icon/scale.svg?react';

interface TeamCardProps {
  team: Team;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const TEAM_STYLES = {
  A: {
    button: 'border-[#2B7FFF]',
    icon: 'bg-[#155DFC]',
    title: 'text-[#51A2FF]'
  },
  B: {
    button: 'border-[#FB2C36]',
    icon: 'bg-[#E7000B]',
    title: 'text-[#FF5A5F]'
  },
  NONE: {
    button: 'border-[#FF6900]',
    icon: 'bg-[#F54900]',
    title: 'text-[#FF8533]'
  }
};

export default function TeamCard({ team, label, description, isSelected, onClick }: TeamCardProps) {
  const styles = TEAM_STYLES[team];
  const Icon = team === 'NONE' ? Scale : Sheild;

  const getBorderClass = () => {
    return isSelected ? styles.button : 'border-[#2D2D3F]';
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-[300px] h-[350px]
        bg-[#1E1E2F]
        rounded-lg
        border-2
        ${getBorderClass()}
        transition-all
        duration-300
        hover:scale-105
        flex flex-col items-center justify-center
        gap-6
        p-6
      `}
    >
      {/* 아이콘 */}
      <div className={`w-24 h-24 rounded-full ${styles.icon} flex items-center justify-center`}>
        <Icon className="w-12 h-12 text-white" />
      </div>

      {/* 라벨 */}
      <h3 className={`text-2xl font-bold ${styles.title}`}>{label}</h3>

      {/* 설명 */}
      <p className="text-[#99A1AF] text-center text-sm">{description}</p>
    </button>
  );
}
