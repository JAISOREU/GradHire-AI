import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'lg' | 'md' | 'sm';
type Rounded = 'full' | 'lg' | 'md' | 'none';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  to?: string;
  rounded?: Rounded;
  children: ReactNode;
};

export const Button = ({ variant = 'primary', size = 'md', loading = false, icon, iconRight, to, rounded = 'lg', className = '', children, disabled, ...rest }: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]';
  const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary text-primary-text hover:bg-primary-hover',
    secondary: 'bg-surface border border-border text-text hover:bg-surface-muted',
    ghost: 'text-text hover:bg-surface-muted',
    danger: 'bg-danger text-white hover:bg-danger/90',
  };
  const sizeClasses: Record<Size, string> = {
    lg: 'min-h-[3rem] px-6 text-base',
    md: 'min-h-[2.75rem] px-4 text-sm',
    sm: 'min-h-[2.25rem] px-3 text-xs',
  };
  const roundedClasses: Record<Rounded, string> = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    md: 'rounded-md',
    none: 'rounded-none',
  };

  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], roundedClasses[rounded], className);

  const content = (
    <span className="flex items-center gap-2">
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {!loading && icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      <span className={cn('flex items-center gap-2', loading && 'opacity-70')}>{children}</span>
      {!loading && iconRight && <span className="flex-shrink-0" aria-hidden="true">{iconRight}</span>}
    </span>
  );

  if (to && !loading) {
    return (
      <Link to={to} className={classes} {...rest as any}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
};
