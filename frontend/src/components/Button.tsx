import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
};

export const Button = ({ variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...rest }: ButtonProps) => {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();
  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="spinner" aria-hidden="true" style={{ width: '1em', height: '1em', borderWidth: '2px' }} />}
      <span style={{ opacity: loading ? 0.7 : 1 }}>{children}</span>
    </button>
  );
};

