interface TermCardProps {
  term: string;
  description: string;
  size?: 'sm' | 'md';
}

export default function TermCard({ term, description, size = 'md' }: TermCardProps) {
  const sizeClasses = {
    sm: {
      container: 'p-3',
      border: 'border',
      rounded: 'rounded-lg',
      title: 'text-xs mb-1',
      description: 'text-xs'
    },
    md: {
      container: 'p-4',
      border: 'border-2',
      rounded: 'rounded-xl',
      title: 'text-sm mb-2',
      description: 'text-sm'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`bg-[#0a0a1a]/50 ${classes.border} border-yellow-500/30 hover:border-yellow-500/50 ${classes.rounded} ${classes.container} transition-all`}
    >
      <h4 className={`text-yellow-400 font-semibold ${classes.title}`}>{term}</h4>
      <p className={`text-gray-300 ${classes.description} leading-relaxed`}>{description}</p>
    </div>
  );
}
