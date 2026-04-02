import type { Team } from '@/commons/types/battle';
import Icon from '@/commons/components/Icon';
import type { IconName } from '@/commons/components/Icon';

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
  const iconName = (team === 'NONE' ? 'scale' : 'shield') as IconName;

  const getBorderClass = () => {
    return isSelected ? styles.button : 'border-[#2D2D3F]';
  };

  return (
    <button
      onClick={onClick}
      className={`
        team-card-width team-card-height
        bg-[#1E1E2F]
        rounded-md xl:rounded-lg
        border-2
        ${getBorderClass()}
        transition-all
        duration-300
        hover:scale-105
        flex flex-col items-center justify-center
        team-card-gap
        team-card-padding
      `}
    >
      {/* 아이콘 */}
      <div className={`team-card-icon-size rounded-full ${styles.icon} flex items-center justify-center`}>
        <Icon name={iconName} className="team-card-icon-inner-size text-white" />
      </div>

      {/* 라벨 */}
      <h3 className={`team-card-title-size font-bold ${styles.title}`}>{label}</h3>

      {/* 설명 */}
      <p className="text-[#99A1AF] text-center team-card-desc-size leading-tight text-[0.7rem]">{description}</p>
    </button>
  );
}
