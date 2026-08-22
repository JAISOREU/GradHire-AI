import { useEffect, useRef, useState, type ReactNode, type ComponentType } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MOTION } from '../motion-tokens';

export interface StaggerOptions {
  stagger?: string;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  childDelay?: string;
}

const DEFAULT_STAGGER: StaggerOptions = {
  stagger: MOTION.stagger.sm,
  once: true,
  threshold: MOTION.thresholds.reveal,
  rootMargin: '0px 0px -40px 0px',
  childDelay: MOTION.stagger.sm,
};

const parseDuration = (value: string): number => {
  const match = value.match(/^(\d+(?:\.\d+)?)(ms|s)$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2];
  return unit === 's' ? num * 1000 : num;
};

export const StaggerContainer = ({
  children,
  options = {},
  className = '',
  as = 'div',
}: {
  children: ReactNode;
  options?: StaggerOptions;
  className?: string;
  as?: ComponentType<any> | string;
}) => {
  const merged = { ...DEFAULT_STAGGER, ...options };
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
  const childrenArray = Array.isArray(children) ? children : [children];

  const staggeredChildren = childrenArray.map((child, index) => {
    if (!child || typeof child !== 'object' || !('type' in child)) return child;

    const delay = reducedMotion ? '0ms' : `${parseDuration(merged.childDelay || '0ms') * index}ms`;
    const props = {
      ...(child.props || {}),
      style: {
        ...(child.props?.style || {}),
        '--stagger-delay': delay,
        transitionDelay: reducedMotion ? '0ms' : delay,
      },
    };

    return { ...child, props };
  });

  return (
    <Tag
      ref={ref}
      className={`stagger-container ${inView ? 'stagger-container--visible' : ''} ${className}`.trim()}
    >
      {staggeredChildren}
    </Tag>
  );
};

export const StaggerChild = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`stagger-child ${className}`.trim()}>{children}</div>;
};
