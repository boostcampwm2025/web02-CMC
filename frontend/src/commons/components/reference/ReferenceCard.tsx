import { ExternalLink } from 'lucide-react';
import type { ReferenceLink } from '@/commons/types/battle';

interface ReferenceCardProps {
  reference: ReferenceLink;
  team: 'A' | 'B';
  size?: 'sm' | 'md';
}

const TEAM_COLOR_CLASSES = {
  A: {
    border: 'border-blue-500/30',
    hover: 'hover:border-blue-500/50',
    text: 'text-blue-400'
  },
  B: {
    border: 'border-orange-500/30',
    hover: 'hover:border-orange-500/50',
    text: 'text-orange-400'
  }
};

export default function ReferenceCard({ reference, team, size = 'md' }: ReferenceCardProps) {
  const colors = TEAM_COLOR_CLASSES[team];

  const sizeClasses = {
    sm: {
      container: 'p-3',
      border: 'border',
      rounded: 'rounded-lg',
      title: 'text-xs mb-2',
      icon: 'w-3 h-3',
      description: 'text-xs'
    },
    md: {
      container: 'p-4',
      border: 'border-2',
      rounded: 'rounded-xl',
      title: 'text-sm mb-3',
      icon: 'w-4 h-4',
      description: 'text-sm'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`bg-[#0a0a1a]/50 ${classes.border} ${colors.border} ${colors.hover} ${classes.rounded} ${classes.container} transition-all hover:shadow-lg group`}
    >
      <a
        href={reference.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${colors.text} font-semibold ${classes.title} hover:underline inline-flex items-center gap-1.5`}
      >
        {reference.title}
        <ExternalLink className={`${classes.icon} opacity-60 flex-shrink-0`} />
      </a>

      <p className={`text-gray-300 ${classes.description} leading-relaxed`}>{reference.summary}</p>
    </div>
  );
}
