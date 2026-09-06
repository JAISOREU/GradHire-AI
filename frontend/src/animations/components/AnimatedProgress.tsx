import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface AnimatedProgressOptions {
  value: number;
  max?: number;
  duration?: number;
  delay?: number;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning';
}

const SIZE_CLASSES = {
  sm: 'var(--space-1, 0.25rem)',
  md: 'var(--space-2, 0.5rem)',
  lg: 'var(--space-3, 0.75rem)',
} as const;

const VARIANT_COLORS = {
  primary: 'var(--color-primary, #fafafa)',
  success: 'var(--color-success, #059669)',
  warning: 'var(--color-warning, #d97706)',
} as const;

export const AnimatedProgress = ({
  value,
  max = 100,
  duration = 1200,
  delay = 0,
  showLabel = true,
  label,
  size = 'md',
  variant = 'primary',
}: AnimatedProgressOptions) => {
  const reducedMotion = useReducedMotion();
  const [animatedValue, setAnimatedValue] = useState(0);
  const startTimeRef = useRef<number | undefined>(undefined);
  const rafRef = useRef<number>(0);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (reducedMotion) {
      setAnimatedValue(percentage);
      return;
    }

    const timeout = setTimeout(() => {
      startTimeRef.current = performance.now();

      const animate = (now: number) => {
        if (!startTimeRef.current) startTimeRef.current = now;
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedValue(eased * percentage);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [percentage, duration, delay, reducedMotion]);

  const height = SIZE_CLASSES[size];
  const color = VARIANT_COLORS[variant];

  return (
    <div className="animated-progress" role="progressbar" aria-valuenow={Math.round(animatedValue)} aria-valuemin={0} aria-valuemax={100}>
      <div className="animated-progress__track">
        <div
          className="animated-progress__bar"
          style={{
            width: `${animatedValue}%`,
            height,
            background: color,
          }}
        />
      </div>
      {showLabel && (
        <div className="animated-progress__labels">
          <span className="animated-progress__value">{Math.round(animatedValue)}%</span>
          {label && <span className="animated-progress__label">{label}</span>}
        </div>
      )}
      <style>{`
        .animated-progress {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-1, 0.25rem);
        }

        .animated-progress__track {
          width: 100%;
          background: var(--color-surface-muted, #fefcf8);
          border-radius: var(--radius-full, 9999px);
          overflow: hidden;
          transition: background-color var(--transition-theme);
        }

        .animated-progress__bar {
          border-radius: var(--radius-full, 9999px);
          will-change: width;
        }

        .animated-progress__labels {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--text-xs, 0.75rem);
        }

        .animated-progress__value {
          font-weight: 600;
          color: var(--color-text);
        }

        .animated-progress__label {
          color: var(--color-text-secondary);
        }

        @media (prefers-reduced-motion: reduce) {
          .animated-progress__bar {
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
};
