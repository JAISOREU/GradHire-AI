import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface AnimatedCounterOptions {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  format?: (value: number) => string;
}

export const AnimatedCounter = ({
  from = 0,
  to,
  duration = 1200,
  delay = 0,
  format = (v) => String(Math.round(v)),
}: AnimatedCounterOptions) => {
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(from);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef(from);

  useEffect(() => {
    if (reducedMotion) {
      setCurrent(to);
      return;
    }

    const timeout = setTimeout(() => {
      startTimeRef.current = performance.now();
      startValueRef.current = from;

      const animate = (now: number) => {
        if (!startTimeRef.current) startTimeRef.current = now;
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(startValueRef.current + (to - startValueRef.current) * eased);

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
  }, [from, to, duration, delay, reducedMotion]);

  return <>{format(current)}</>;
};
