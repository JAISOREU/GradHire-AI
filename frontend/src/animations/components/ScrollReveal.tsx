import { useEffect, useRef, useState, type ReactNode, type ComponentType } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MOTION } from '../motion-tokens';

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
  duration?: string;
  distance?: string;
  blur?: string;
  scale?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

const DEFAULT_OPTIONS: ScrollRevealOptions = {
  threshold: MOTION.thresholds.reveal,
  rootMargin: '0px 0px -40px 0px',
  once: true,
  delay: 0,
  duration: MOTION.duration.slow,
  distance: MOTION.distance.md,
  blur: MOTION.blur.md,
  scale: 1,
  direction: 'up',
};

const DIRECTION_TRANSFORMS: Record<string, string> = {
  up: `translateY(var(--sr-distance))`,
  down: `translateY(calc(-1 * var(--sr-distance)))`,
  left: `translateX(var(--sr-distance))`,
  right: `translateX(calc(-1 * var(--sr-distance)))`,
  none: 'none',
};

export const ScrollReveal = ({
  children,
  options = {},
  className = '',
  as = 'div',
}: {
  children: ReactNode;
  options?: ScrollRevealOptions;
  className?: string;
  as?: ComponentType<any> | string;
}) => {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (merged.once) observer.disconnect();
        } else if (!merged.once) {
          setInView(false);
        }
      },
      { threshold: merged.threshold, rootMargin: merged.rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [merged.threshold, merged.rootMargin, merged.once, reducedMotion]);

  const Tag = as as ComponentType<any>;
  const style: Record<string, unknown> = {
    '--sr-duration': merged.duration,
    '--sr-distance': merged.distance,
    '--sr-blur': merged.blur,
    '--sr-scale': merged.scale,
    '--sr-delay': `${merged.delay}ms`,
  };

  if (reducedMotion || inView) {
    style.opacity = 1;
    style.transform = 'none';
    style.filter = 'none';
  } else {
    style.opacity = 0;
    style.transform = DIRECTION_TRANSFORMS[merged.direction || 'up'] || DIRECTION_TRANSFORMS.up;
    style.filter = `blur(${merged.blur})`;
  }

  return (
    <Tag
      ref={ref}
      className={`scroll-reveal ${inView ? 'scroll-reveal--visible' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  );
};
