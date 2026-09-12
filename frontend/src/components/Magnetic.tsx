import type { ReactNode } from 'react';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Magnetic — neutralized per design system.
 * No pointer-tracking; renders children unchanged.
 */
export const Magnetic = ({ children, className = '' }: MagneticProps) => (
  <div className={`magnetic ${className}`.trim()}>{children}</div>
);