import type { CSSProperties } from 'react';

type AnimatedLogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

export const AnimatedLogo = ({ size = 32, showText = true, className = '' }: AnimatedLogoProps) => (
  <span className={`animated-logo ${className}`} style={{ '--logo-size': `${size}px` } as CSSProperties}>
    <span className="animated-logo__mark" aria-hidden="true" />
    {showText && (
      <span className="animated-logo__text">
        <span className="animated-logo__name">Gradture</span>
      </span>
    )}
  </span>
);
