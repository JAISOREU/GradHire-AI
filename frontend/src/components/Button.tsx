import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) => {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

