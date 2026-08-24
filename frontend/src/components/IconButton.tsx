import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
};

const SIZE_CLASSES = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
} as const;

const VARIANT_CLASSES = {
  ghost: 'text-text hover:bg-surface-muted',
  outline: 'border border-border text-text hover:bg-surface-muted',
  solid: 'bg-surface-muted text-text hover:bg-border',
} as const;

export const IconButton = ({ children, size = 'md', variant = 'ghost', className = '', ...rest }: IconButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
