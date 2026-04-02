import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none' | 'r-md' | 'r-lg' | 'r-xl';
  fullWidth?: boolean;
}

const VARIANT_STYLES = {
  primary: 'bg-orange-500 hover:bg-orange-600 text-white font-semibold',
  secondary: 'bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white',
  ghost: 'bg-transparent border border-[#2b2b3e] text-gray-200 hover:bg-[#1a1a2e]'
} as const;

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base'
} as const;

const DEFAULT_ROUNDED = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl'
} as const;

const ROUNDED_STYLES = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
  none: 'rounded-none',
  'r-md': 'rounded-r-md',
  'r-lg': 'rounded-r-lg',
  'r-xl': 'rounded-r-xl'
} as const;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'primary', size = 'md', rounded, fullWidth = false, className = '', ...props },
  ref
) {
  const roundedClass = rounded ? ROUNDED_STYLES[rounded] : DEFAULT_ROUNDED[size];

  return (
    <button
      ref={ref}
      className={twMerge(
        'inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        roundedClass,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
