import { Sparkles, ChevronUp } from 'lucide-react';
import type { ReferenceLink } from '@/commons/types/battle';
import ReferenceCard from './ReferenceCard';

export interface TeamReferencesAccordionProps {
  team: 'A' | 'B';
  perspective: string;
  references: ReferenceLink[];
  isExpanded: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

const TEAM_COLOR_CLASSES = {
  A: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    gradient: 'from-blue-600 to-blue-500',
    hover: 'hover:border-blue-500/50'
  },
  B: {
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    gradient: 'from-orange-600 to-orange-500',
    hover: 'hover:border-orange-500/50'
  }
};

export default function TeamReferencesAccordion({
  team,
  perspective,
  references,
  isExpanded,
  onToggle,
  size = 'md'
}: TeamReferencesAccordionProps) {
  const colors = TEAM_COLOR_CLASSES[team];

  const sizeClasses = {
    sm: {
      container: 'space-y-3',
      button: 'p-3',
      buttonBorder: 'border',
      buttonRounded: 'rounded-lg',
      badge: 'w-8 h-8',
      badgeText: 'text-sm',
      title: 'text-sm',
      subtitle: 'text-xs',
      icon: 'w-5 h-5',
      content: 'space-y-2',
      perspectiveContainer: 'p-2',
      perspectiveIcon: 'w-3 h-3',
      perspectiveText: 'text-xs'
    },
    md: {
      container: 'space-y-4',
      button: 'p-4',
      buttonBorder: 'border-2',
      buttonRounded: 'rounded-lg',
      badge: 'w-10 h-10',
      badgeText: 'text-lg',
      title: 'text-lg',
      subtitle: 'text-xs',
      icon: 'w-6 h-6',
      content: 'space-y-3',
      perspectiveContainer: 'p-3',
      perspectiveIcon: 'w-4 h-4',
      perspectiveText: 'text-sm'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={classes.container}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 ${classes.button} ${classes.buttonRounded} ${classes.buttonBorder} ${colors.border} ${colors.bg} ${colors.hover} transition-all`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`${classes.badge} rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}
          >
            <span className={`text-white font-bold ${classes.badgeText}`}>{team}</span>
          </div>
          <div className="text-left">
            <h3 className={`text-white font-semibold ${classes.title}`}>구현 {team} 관점</h3>
            <p className={`text-gray-400 ${classes.subtitle}`}>{references.length}개의 참고 자료</p>
          </div>
        </div>
        <div className={`${colors.text} transition-transform duration-200 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>
          <ChevronUp className={classes.icon} />
        </div>
      </button>

      {isExpanded && (
        <div className={`${classes.content} animate-in fade-in duration-200`}>
          {/* 관점 설명 */}
          <div className={`${colors.bg} ${colors.border} border rounded-lg ${classes.perspectiveContainer}`}>
            <div className="flex items-start gap-2">
              <Sparkles className={`${classes.perspectiveIcon} ${colors.text} flex-shrink-0 mt-0.5`} />
              <p className={`text-gray-300 ${classes.perspectiveText}`}>{perspective}</p>
            </div>
          </div>

          {/* 참고 자료 목록 */}
          {references.map((ref, index) => (
            <ReferenceCard key={index} reference={ref} team={team} size={size} />
          ))}
        </div>
      )}
    </div>
  );
}
