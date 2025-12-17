import type { ReactNode } from 'react';

interface IconBoxProps {
  children: ReactNode;
  bgColor: string;
  size?: number;
  className?: string;
}

export default function IconBox({ children, bgColor, size = 48, className = '' }: IconBoxProps) {
  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor
      }}
    >
      {children}
    </div>
  );
}
