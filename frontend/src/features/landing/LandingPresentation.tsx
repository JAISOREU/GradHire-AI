import { ReactNode, useEffect, useRef, useState, useCallback, CSSProperties } from 'react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ThemeNavArrow } from '../../components/ThemeNavArrow';
import { AmbientBackground, AmbientBackgroundHandle } from '../../components/AmbientBackground';
import { SpatialBackground } from '../../components/SpatialBackground';

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

const findPrimaryScroller = (slideEl: HTMLElement | null): HTMLElement | null => {
  if (!slideEl) return null;

  // Flagged slides (HowItWorks/CTA) scroll the whole page, not an inner card.
  if (slideEl.dataset.scrollable === 'true') return slideEl;

  // Otherwise prefer the largest scrollable region: compact feature layouts
  // scroll their internal card body.
  let best: HTMLElement | null = null;
  let bestRange = 0;
  for (const node of [slideEl, ...Array.from(slideEl.querySelectorAll('*'))]) {
    const el = node as HTMLElement;
    const oy = getComputedStyle(el).overflowY;
    if (oy !== 'auto' && oy !== 'scroll') continue;
    const range = el.scrollHeight - el.clientHeight;
    if (range > bestRange) {
      bestRange = range;
      best = el;
    }
  }
  return bestRange > 4 ? best : null;
};

export const LandingPresentation = ({ slides }: LandingPresentationProps) => {
  const lastIndex = slides.length - 1;
  const [active, setActive] = useState(0);
  const [railLeaving, setRailLeaving] = useState<{ index: number; direction: 'forward' | 'backward' } | null>(null);
  const [showRail, setShowRail] = useState(true);
  const activeRef = useRef(0);
  const isTransitioning = useRef(false);
  const railAnimationTimeout = useRef<number | null>(null);
  const railHideTimer = useRef<number | null>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);
  const backdropRef = useRef<AmbientBackgroundHandle | null>(null);
  const previousActiveRef = useRef(0);

  // Show rail briefly on mount and after each navigation, then hide after 1s.
  useEffect(() => {
    setShowRail(true);
    railHideTimer.current = window.setTimeout(() => setShowRail(false), 1000);
    return () => {
      if (railHideTimer.current !== null) window.clearTimeout(railHideTimer.current);
    };
  }, [active]);

  // Cleanup rail timer on unmount.
  useEffect(() => () => {
    if (railHideTimer.current !== null) window.clearTimeout(railHideTimer.current);
    if (railAnimationTimeout.current !== null) window.clearTimeout(railAnimationTimeout.current);
  }, []);

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

  // Every page must start at the top: reset the slide and all nested scrollers,
  // and undo the native hash-anchor scroll that browsers apply to the deck.
  useEffect(() => {
    const el = slideRefs.current[active];
    if (!el) return;
    const deck = el.closest('.landing-presentation');
    if (deck) (deck as HTMLElement).scrollTop = 0;
    const stack = [el, ...Array.from(el.querySelectorAll('*'))] as HTMLElement[];
    for (const node of stack) {
      const oy = getComputedStyle(node).overflowY;
      if (oy === 'auto' || oy === 'scroll' || node.scrollHeight > node.clientHeight) {
        node.scrollTop = 0;
      }
    }
  }, [active]);

  // Push the interactive backdrop through the deck: the integer part is the
  // active slide, plus a scroll fraction inside the active slide so the
  // background parallax stays tied to the page contents. On slide changes we
  // also announce the new scene and the direction of travel for the surge.
  useEffect(() => {
    const direction: 'forward' | 'backward' = active >= previousActiveRef.current ? 'forward' : 'backward';
    previousActiveRef.current = active;
    backdropRef.current?.setScene(slides[active].id, direction);
    backdropRef.current?.setProgress(active);
  }, [active, slides]);

  useEffect(() => {
    const el = slideRefs.current[active];
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = el.scrollHeight - el.clientHeight;
      const frac = range > 4 ? Math.min(1, el.scrollTop / range) : 0;
      backdropRef.current?.setProgress(active + frac);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [active]);

  // Wheel: advance only when the page's content is scrolled to its boundary.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const slideEl = slideRefs.current[activeRef.current];
      const delta = e.deltaY;
      const goingDown = delta > 0;

      const scroller = slideEl ? findPrimaryScroller(slideEl) : null;
      if (scroller) {
        const atTop = scroller.scrollTop <= 0;
        const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;

        if (goingDown && !atBottom) {
          e.preventDefault();
          scroller.scrollTop += delta;
          return;
        }
        if (!goingDown && !atTop) {
          e.preventDefault();
          scroller.scrollTop += delta;
          return;
        }
        // At boundary: require an additional scroll gesture to advance
        e.preventDefault();
        goTo(activeRef.current + (goingDown ? 1 : -1));
        return;
      }

      // Slide fully fits the viewport: direct navigation
      if (isTransitioning.current) return;
      if (Math.abs(delta) < WHEEL_THRESHOLD) return;

      const dir = goingDown ? 1 : -1;
      if ((dir > 0 && activeRef.current >= lastIndex) || (dir < 0 && activeRef.current <= 0)) {
        return;
      }

      e.preventDefault();
      goTo(activeRef.current + dir);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [goTo, lastIndex]);

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

  // Touch / swipe: native scroll until boundary, then manual pagination.
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
      const scroller = slideEl ? findPrimaryScroller(slideEl) : null;
      if (!scroller) {
        e.preventDefault();
        return;
      }
      const atTop = scroller.scrollTop <= 0;
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      if ((dy > 0 && !atBottom) || (dy < 0 && !atTop)) {
        return; // native scroll already consumed the gesture
      }
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
      const scroller = slideEl ? findPrimaryScroller(slideEl) : null;
      if (scroller) {
        const atTop = scroller.scrollTop <= 0;
        const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
        const goingDown = dy > 0;
        if ((goingDown && !atBottom) || (!goingDown && !atTop)) {
          return; // native scroll already consumed the gesture
        }
        if ((goingDown && atBottom) || (!goingDown && atTop)) {
          goTo(activeRef.current + (goingDown ? 1 : -1));
        }
        return;
      }

      // Slide fully fits the viewport: direct swipe navigation
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
        <AmbientBackground ref={backdropRef} />
        <SpatialBackground />
        {slides.map((slide, i) => (
        <section
          key={slide.id}
          id={slide.id}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          className={`presentation-slide ${slide.scrollable ? 'presentation-slide--scrollable' : ''} ${
            i === active ? 'is-active' : ''
          } ${slide.id === 'hero' ? 'hero-slide' : ''}`}
          data-scrollable={slide.scrollable ? 'true' : 'false'}
          aria-hidden={i === active ? undefined : true}
          style={
            {
              '--slide-offset': `${(i - active) * 100}dvh`,
              '--slide-offset-visual': `${(i - active) * 100 * 1.12}dvh`,
              '--slide-offset-content': `${(i - active) * 100 * 0.84}dvh`,
              '--slide-duration': `${duration}ms`,
              opacity: Math.abs(i - active) <= 1 ? 1 : 0,
              transitionDuration: `${duration}ms`,
              pointerEvents: i === active ? 'auto' : 'none',
              zIndex: i === active ? 3 : 1,
            } as CSSProperties
          }
        >
          {slide.node}
        </section>
      ))}

      <div className="presentation-theme-toggle">
        <ThemeNavArrow
          active={active}
          goTo={goTo}
          lastIndex={lastIndex}
          reduced={reduced}
        />
        <ThemeToggle />
      </div>

      <aside
        className={`presentation-rail ${showRail ? 'presentation-rail--visible' : ''}`}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Slide ${active + 1}: ${slides[active].label}`}
      >
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