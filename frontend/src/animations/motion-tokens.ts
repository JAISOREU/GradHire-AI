export const MOTION = {
  duration: {
    instant: '100ms',
    fast: '200ms',
    base: '300ms',
    slow: '500ms',
    slower: '800ms',
    slowest: '1200ms',
  },
  easing: {
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    linear: 'linear',
  },
  stagger: {
    xs: '50ms',
    sm: '80ms',
    md: '120ms',
    lg: '180ms',
    xl: '240ms',
  },
  distance: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '32px',
  },
  scale: {
    xs: 1.02,
    sm: 1.05,
    md: 1.1,
    lg: 1.15,
  },
  opacity: {
    hidden: 0,
    visible: 1,
    subtle: 0.7,
  },
  blur: {
    sm: '2px',
    md: '4px',
    lg: '8px',
  },
  thresholds: {
    reveal: 0.2,
    active: 0.5,
    complete: 0.85,
  },
} as const;

export type MotionTokens = typeof MOTION;
