import type { Transition, SpringOptions } from 'motion/react';

export const springGentle: SpringOptions = {
  stiffness: 120,
  damping: 20,
  mass: 1,
};

export const springResponsive: SpringOptions = {
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

export const springBouncy: SpringOptions = {
  stiffness: 400,
  damping: 20,
  mass: 0.6,
};

export const transitionInstant: Transition = { duration: 0.1, ease: 'easeOut' };
export const transitionFast: Transition = { duration: 0.2, ease: [0.22, 1, 0.36, 1] };
export const transitionBase: Transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] };
export const transitionSlow: Transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
export const transitionSlower: Transition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] };
export const transitionSlowest: Transition = { duration: 1.2, ease: [0.22, 1, 0.36, 1] };
export const transitionSpring: Transition = { type: 'spring', ...springResponsive };

export function toMotionDuration(value: string): number {
  return Number.parseFloat(value) / 1000;
}

export function toSpringTransition(duration: string): Transition {
  const ms = Number.parseFloat(duration);
  return {
    type: 'spring',
    stiffness: 300,
    damping: Math.max(15, 30 - ms / 40),
    mass: 0.8,
  };
}
