import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  textClass: string;
  bgClass: string;
  className?: string;
}

export default function Badge({ children, textClass, bgClass, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
          ${textClass} ${bgClass} ${className}`}
    >
      {children}
    </span>
  );
}
