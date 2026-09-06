import { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ThemeNavArrow } from '../../components/ThemeNavArrow';

export interface PresentationSlide {
  id: string;
  label: string;
  node: ReactNode;
  scrollable?: boolean;
}

interface LandingPresentationProps {
  slides: PresentationSlide[];
}

const TRANSITION_MS = 850;
const WHEEL_THRESHOLD = 80;
const SWIPE_THRESHOLD = 50;
const RAIL_ANIMATION_MS = 620;

const NEXT_KEYS = ['ArrowDown', 'ArrowRight', 'PageDown', ' ', 'Spacebar'];
const PREV_KEYS = ['ArrowUp', 'ArrowLeft', 'PageUp'];

const isInteractiveElement = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return Boolean(el.closest('input, textarea, select, button, a, [contenteditable="true"], [role="button"]'));
};

export const LandingPresentation = ({ slides }: LandingPresentationProps) => {
  const lastIndex = slides.length - 1;
  const [active, setActive] = useState(0);
  const [railLeaving, setRailLeaving] = useState<{ index: number; direction: 'forward' | 'backward' } | null>(null);
  const activeRef = useRef(0);
  const isTransitioning = useRef(false);
  const railAnimationTimeout = useRef<number | null>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const duration = reduced ? 0 : TRANSITION_MS;

  const goTo = useCallback(
    (next: number) => {
      const target = Math.max(0, Math.min(lastIndex, next));
      if (target === activeRef.current) return;
      if (isTransitioning.current) return;

      const previous = activeRef.current;
      const direction = target > previous ? 'forward' : 'backward';
      if (railAnimationTimeout.current !== null) window.clearTimeout(railAnimationTimeout.current);
      setRailLeaving({ index: previous, direction });
      railAnimationTimeout.current = window.setTimeout(() => setRailLeaving(null), reduced ? 0 : RAIL_ANIMATION_MS);
      activeRef.current = target;
      setActive(target);
      isTransitioning.current = true;
      window.setTimeout(() => {
        isTransitioning.current = false;
      }, duration);
    },
    [lastIndex, duration, reduced]
  );

  // Reset scroll position of scrollable slides when they become active.
  useEffect(() => {
    const el = slideRefs.current[active];
    if (el && el.dataset.scrollable === 'true') {
      el.scrollTop = 0;
    }
  }, [active]);

  // Wheel: advance only when at bottom for scrollable slides.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const slideEl = slideRefs.current[activeRef.current];
      const delta = e.deltaY;
      const abs = Math.abs(delta);

      const scrollable = slideEl?.dataset.scrollable === 'true';
      if (scrollable) {
        const el = slideEl as HTMLElement;
        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        const goingDown = delta > 0;

        if (goingDown && !atBottom) {
          return; // let inner content scroll natively
        }
        if (!goingDown && !atTop) {
          return; // let inner content scroll natively
        }
        // At boundary: require an additional scroll gesture to advance
        if (goingDown && atBottom) {
          e.preventDefault();
          goTo(activeRef.current + 1);
          return;
        }
        if (!goingDown && atTop) {
          e.preventDefault();
          goTo(activeRef.current - 1);
          return;
        }
        return;
      }

      // Non-scrollable slide: direct navigation
      if (isTransitioning.current) return;
      if (abs < WHEEL_THRESHOLD) return;

      const dir = delta > 0 ? 1 : -1;
      if ((dir > 0 && activeRef.current >= lastIndex) || (dir < 0 && activeRef.current <= 0)) {
        return;
      }

      e.preventDefault();
      goTo(activeRef.current + dir);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [goTo, lastIndex]);

  useEffect(() => () => {
    if (railAnimationTimeout.current !== null) window.clearTimeout(railAnimationTimeout.current);
  }, []);

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isInteractiveElement(e.target)) return;

      if (e.key === 'Home') {
        e.preventDefault();
        goTo(0);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        goTo(lastIndex);
        return;
      }

      let dir = 0;
      if (NEXT_KEYS.includes(e.key)) dir = 1;
      else if (PREV_KEYS.includes(e.key)) dir = -1;
      else return;

      e.preventDefault();
      if (isTransitioning.current) return;
      if ((dir > 0 && activeRef.current >= lastIndex) || (dir < 0 && activeRef.current <= 0)) {
        return;
      }
      goTo(activeRef.current + dir);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, lastIndex]);

  // Touch / swipe: manual pagination only.
  const touch = useRef({ startY: 0, lastY: 0, active: false });
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      touch.current.startY = e.touches[0].clientY;
      touch.current.lastY = touch.current.startY;
      touch.current.active = true;
    };
    const onMove = (e: TouchEvent) => {
      if (!touch.current.active) return;
      const y = e.touches[0].clientY;
      const dy = touch.current.lastY - y;
      touch.current.lastY = y;
      const slideEl = slideRefs.current[activeRef.current];
      const scrollable = slideEl?.dataset.scrollable === 'true';
      if (!scrollable) {
        e.preventDefault();
        return;
      }
      const el = slideEl as HTMLElement;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if ((dy > 0 && !atBottom) || (dy < 0 && !atTop)) {
        return; // native scroll already consumed the gesture
      }
      // At boundary: allow the swipe to potentially advance
      if ((dy > 0 && atBottom) || (dy < 0 && atTop)) {
        e.preventDefault();
      }
    };
    const onEnd = (e: TouchEvent) => {
      if (!touch.current.active) return;
      touch.current.active = false;
      const dy = touch.current.startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;

      const slideEl = slideRefs.current[activeRef.current];
      const scrollable = slideEl?.dataset.scrollable === 'true';
      if (scrollable) {
        const el = slideEl as HTMLElement;
        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        const goingDown = dy > 0;
        if ((goingDown && !atBottom) || (!goingDown && !atTop)) {
          return; // native scroll already consumed the gesture
        }
        if (goingDown && atBottom) {
          goTo(activeRef.current + 1);
          return;
        }
        if (!goingDown && atTop) {
          goTo(activeRef.current - 1);
          return;
        }
        return;
      }

      // Non-scrollable slide: direct swipe navigation
      if (isTransitioning.current) return;
      const dir = dy > 0 ? 1 : -1;
      if ((dir > 0 && activeRef.current >= lastIndex) || (dir < 0 && activeRef.current <= 0)) {
        return;
      }
      goTo(activeRef.current + dir);
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [goTo, lastIndex]);

  // Deep-link / back-forward hash navigation.
  useEffect(() => {
    const apply = (idx: number) => {
      if (idx < 0 || idx > lastIndex || idx === activeRef.current) return;
      if (isTransitioning.current) return;
      const previous = activeRef.current;
      const direction = idx > previous ? 'forward' : 'backward';
      if (railAnimationTimeout.current !== null) window.clearTimeout(railAnimationTimeout.current);
      setRailLeaving({ index: previous, direction });
      railAnimationTimeout.current = window.setTimeout(() => setRailLeaving(null), reduced ? 0 : RAIL_ANIMATION_MS);
      activeRef.current = idx;
      setActive(idx);
      isTransitioning.current = true;
      window.setTimeout(() => {
        isTransitioning.current = false;
      }, duration);
    };
    const onHash = () => {
      const id = window.location.hash.replace('#', '');
      apply(slides.findIndex((s) => s.id === id));
    };
    window.addEventListener('hashchange', onHash);

    const initialId = window.location.hash.replace('#', '');
    const initialIdx = slides.findIndex((s) => s.id === initialId);
    if (initialIdx > 0) apply(initialIdx);

    return () => window.removeEventListener('hashchange', onHash);
  }, [slides, lastIndex, duration, reduced]);

  return (
    <div
      className="landing-presentation"
      role="region"
      aria-roledescription="presentation"
      aria-label="Gradture product presentation"
    >
      {slides.map((slide, i) => (
        <section
          key={slide.id}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          className={`presentation-slide ${slide.scrollable ? 'presentation-slide--scrollable' : ''} ${
            i === active ? 'is-active' : ''
          } ${slide.id === 'hero' ? 'hero-slide' : ''}`}
          data-scrollable={slide.scrollable ? 'true' : 'false'}
          aria-hidden={i === active ? undefined : true}
          style={{
            transform: `translateY(${(i - active) * 100}%)`,
            opacity: Math.abs(i - active) <= 1 ? 1 : 0,
            transitionDuration: `${duration}ms`,
            pointerEvents: i === active ? 'auto' : 'none',
            zIndex: i === active ? 3 : 1,
          }}
        >
          {slide.node}
        </section>
      ))}

      <div className="presentation-theme-toggle">
        <ThemeNavArrow
          active={active}
          goTo={goTo}
          lastIndex={lastIndex}
          isTransitioning={isTransitioning}
          reduced={reduced}
        />
        <ThemeToggle />
      </div>

      <aside className="presentation-rail" aria-live="polite" aria-atomic="true" aria-label={`Slide ${active + 1}: ${slides[active].label}`}>
        <span className="presentation-rail__line" aria-hidden="true" />
        {railLeaving && (
          <span className={`presentation-rail__label presentation-rail__label--leaving presentation-rail__label--${railLeaving.direction}`} aria-hidden="true">
            <span>{String(railLeaving.index + 1).padStart(2, '0')}</span>
            <span>{slides[railLeaving.index].label}</span>
          </span>
        )}
        <span className={`presentation-rail__label presentation-rail__label--active${railLeaving ? ` presentation-rail__label--${railLeaving.direction}` : ''}`}>
          <span>{String(active + 1).padStart(2, '0')}</span>
          <span>{slides[active].label}</span>
        </span>
      </aside>
    </div>
  );
};
