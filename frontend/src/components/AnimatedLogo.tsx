import type { CSSProperties } from 'react';

type AnimatedLogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

const LOGO_SVG = (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Graduation cap base */}
    <path
      d="M20 8L4 16L20 24L36 16L20 8Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      className="logo-cap"
    />
    {/* Tassel line */}
    <path
      d="M20 24V32"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="logo-tassel"
    />
    {/* Tassel hang */}
    <circle cx="20" cy="33" r="1.5" fill="currentColor" className="logo-tassel-dot" />
    {/* Connection nodes */}
    <circle cx="4" cy="16" r="2" fill="currentColor" className="logo-node logo-node--1" />
    <circle cx="20" cy="8" r="2" fill="currentColor" className="logo-node logo-node--2" />
    <circle cx="36" cy="16" r="2" fill="currentColor" className="logo-node logo-node--3" />
    <circle cx="20" cy="24" r="2" fill="currentColor" className="logo-node logo-node--4" />
    {/* Connection lines */}
    <path
      d="M4 16H36M20 8V24M4 16L20 24M36 16L20 24"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.3"
      className="logo-lines"
    />
  </svg>
);

export const AnimatedLogo = ({ size = 32, showText = true, className = '' }: AnimatedLogoProps) => (
  <span className={`animated-logo ${className}`} style={{ '--logo-size': `${size}px` } as CSSProperties}>
    <span className="animated-logo__mark">{LOGO_SVG}</span>
    {showText && (
      <span className="animated-logo__text">
        <span className="animated-logo__name">Gradture</span>
      </span>
    )}
  </span>
);
