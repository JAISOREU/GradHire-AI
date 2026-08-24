import { motion } from 'motion/react';
import { useReducedMotion } from './hooks/useReducedMotion';
import { MOTION } from './motion-tokens';

const EASING = [0.22, 1, 0.36, 1] as const;

export const FadeIn = motion.div;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: string;
  duration?: string;
  blur?: string;
  scale?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  reducedMotion?: boolean;
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  distance = MOTION.distance.md,
  duration = MOTION.duration.slow,
  blur = MOTION.blur.md,
  scale = 1,
  direction = 'up',
  reducedMotion: reducedMotionOverride,
}: RevealProps) {
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = reducedMotionOverride ?? systemReducedMotion;

  const offset = Number.parseFloat(distance) || 0;
  const x = direction === 'left' ? -offset : direction === 'right' ? offset : 0;
  const y = direction === 'up' ? -offset : direction === 'down' ? offset : 0;

  const baseTransition = {
    duration: Number.parseFloat(duration) / 1000,
    delay,
    ease: EASING,
  };

  const initial = reducedMotion
    ? undefined
    : {
        opacity: 0,
        x,
        y,
        filter: `blur(${Number.parseFloat(blur) || 0}px)`,
        ...(scale !== 1 ? { scale } : {}),
      };

  const animate = reducedMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, filter: 'blur(0px)', scale: 1 };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={baseTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const SlideIn = motion.div;

export const ScaleIn = motion.div;

export const HoverLift = motion.div;

export const PageTransition = motion.div;

export const AnimatedPresence = motion.create;
