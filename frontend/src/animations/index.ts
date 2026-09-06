export { ScrollReveal } from './components/ScrollReveal';
export { StaggerContainer, StaggerChild } from './components/StaggerContainer';
export { AnimatedCounter } from './components/AnimatedCounter';
export { AnimatedProgress } from './components/AnimatedProgress';

export {
  fadeInVariants,
  slideUpVariants,
  slideDownVariants,
  scaleInVariants,
  drawLineVariants,
  staggerContainer,
  staggerChild,
  heroRevealVariants,
  heroChildVariants,
} from './variants';

export {
  springGentle,
  springResponsive,
  springBouncy,
  transitionInstant,
  transitionFast,
  transitionBase,
  transitionSlow,
  transitionSlower,
  transitionSlowest,
  transitionSpring,
  toMotionDuration,
  toSpringTransition,
} from './transitions';

export {
  Reveal,
  SlideIn,
  ScaleIn,
  HoverLift,
  PageTransition,
  AnimatedPresence,
  FadeIn,
} from './presets';

export { useReducedMotion } from './hooks/useReducedMotion';
export { MOTION } from './motion-tokens';
export type { ScrollRevealOptions } from './components/ScrollReveal';
export type { StaggerOptions } from './components/StaggerContainer';
export type { AnimatedCounterOptions } from './components/AnimatedCounter';
export type { AnimatedProgressOptions } from './components/AnimatedProgress';
