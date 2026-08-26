import type { CSSProperties } from 'react';

const LOGO_SVG = (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 8L4 16L20 24L36 16L20 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M20 24V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="20" cy="33" r="2" fill="currentColor" />
    <circle cx="4" cy="16" r="2.5" fill="currentColor" />
    <circle cx="20" cy="8" r="2.5" fill="currentColor" />
    <circle cx="36" cy="16" r="2.5" fill="currentColor" />
    <circle cx="20" cy="24" r="2.5" fill="currentColor" />
  </svg>
);

type LogoProps = {
  size?: number;
  className?: string;
};

export const Logo = ({ size = 32, className = '' }: LogoProps) => (
  <span
    className={`header-logo__mark ${className}`}
    style={{ width: `${size}px`, height: `${size}px` } as CSSProperties}
  >
    {LOGO_SVG}
  </span>
);
