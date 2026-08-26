import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'lg' | 'md' | 'sm';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  to?: string;
  children: ReactNode;
};

export const Button = ({ variant = 'primary', size = 'md', loading = false, icon, iconRight, to, className = '', children, disabled, ...rest }: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
  const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary text-primary-text hover:bg-primary-hover shadow-sm hover:shadow-md',
    secondary: 'bg-surface-muted text-text hover:bg-border-strong/20',
    ghost: 'text-text hover:bg-surface-muted',
    danger: 'bg-danger text-white hover:bg-danger/90 shadow-sm hover:shadow-md',
  };
  const sizeClasses: Record<Size, string> = {
    lg: 'min-h-[3rem] px-6 text-base rounded-lg',
    md: 'min-h-[2.75rem] px-4 text-sm rounded-lg',
    sm: 'min-h-[2.25rem] px-3 text-xs rounded-lg',
  };

  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

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
