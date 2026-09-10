import type { CSSProperties } from 'react';
import { BrandMark } from './BrandMark';

type AnimatedLogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

export const AnimatedLogo = ({ size = 40, showText = true, className = '' }: AnimatedLogoProps) => (
  <span className={`animated-logo ${className}`} style={{ '--logo-size': `${size}px` } as CSSProperties}>
    <BrandMark />
    {showText && (
      <span className="animated-logo__text">
        <span className="animated-logo__name">GradTure</span>
      </span>
    )}
  </span>
);