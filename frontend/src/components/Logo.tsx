import type { CSSProperties } from 'react';

type LogoProps = {
  size?: number;
  className?: string;
};

export const Logo = ({ size = 32, className = '' }: LogoProps) => (
  <span
    className={`header-logo__mark ${className}`}
    style={{ width: `${size}px`, height: `${size}px` } as CSSProperties}
    aria-hidden="true"
  />
);
