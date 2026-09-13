import { useCallback, useEffect, useRef } from 'react';

/**
 * SpatialBackground
 * -----------------
 * A decorative, pointer-events-none depth layer rendered behind the landing
 * content. It composites several CSS-transformed decorative bands:
 *
 *   .spatial-layer--field   (0.05)  fixed subtle gradient grid
 *   .spatial-layer--aurora   (0.1)  soft aurora glow
 *   .spatial-layer--glow     (0.15) focused radial glows
 *   .spatial-layer--orb-a    (0.2)  slow-moving decorative orb
 *   .spatial-layer--orb-b    (0.12) secondary orb
 *   .spatial-layer--network  (0.18) career-network node/edge pattern
 *   .spatial-layer--glyph    (0.25) slow geometric accent marks
 *
 * All colours come from Gradture CSS variables, so DARK <-> LIGHT both
 * resolve correctly and the theme-toggle transition fades everything smoothly.
 *
 * Behaviour:
 *  - scroll parallax: layers drift relative to the `.landing-presentation` scroll
 *  - mouse parallax: a gentle 5–20 px offset (desktop only, disabled on touch)
 *  - idle drift: subtle sine-bob + lateral drift on a single rAF loop
 *  - respects prefers-reduced-motion: all motion frozen
 *  - pointer-events: none on every layer
 */
export const SpatialBackground = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const layerEls = useRef<HTMLDivElement[]>([]);
  const state = useRef({
    mouse: { x: 0, y: 0, tx: 0, ty: 0 },
    scroll: { x: 0, y: 0, tx: 0, ty: 0 },
    time: 0,
  });
  const reducedRef = useRef(false);
  const rafId = useRef<number | null>(null);
  const lastFrame = useRef(performance.now());

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const tick = useCallback(() => {
    if (reducedRef.current) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastFrame.current) / 1000);
    lastFrame.current = now;
    const s = state.current;
    s.time = now;

    const ease = 1 - Math.exp(-5 * dt);
    s.mouse.x += (s.mouse.tx - s.mouse.x) * ease;
    s.mouse.y += (s.mouse.ty - s.mouse.y) * ease;
    s.scroll.x = lerp(s.scroll.x, s.scroll.tx, 1 - Math.exp(-3 * dt));
    s.scroll.y = lerp(s.scroll.y, s.scroll.ty, 1 - Math.exp(-3 * dt));

    const t = now / 1000;
    const mx = s.mouse.x;
    const my = s.mouse.y;
    const sy = s.scroll.y;

    for (let i = 0; i < layerEls.current.length; i++) {
      const el = layerEls.current[i];
      if (!el) continue;
      const d = parseFloat(el.dataset.depth ?? '1');
      const bob = Math.sin(t * 0.55 + d * 3.1) * 6;
      const driftX = Math.sin(t * 0.18 + d * 2.0) * 16;
      const driftY = Math.cos(t * 0.22 + d * 1.6) * 10;
      el.style.transform =
        `translate3d(${(driftX + mx * (12 + d * 30)).toFixed(1)}px,` +
        `${(driftY + bob + my * (12 + d * 30) + sy * d * 5).toFixed(1)}px,0)`;
    }

    rafId.current = window.requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (rafId.current !== null) return;
    lastFrame.current = performance.now();
    rafId.current = window.requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    if (rafId.current !== null) {
      window.cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isTouch = window.matchMedia('(hover: none)').matches;

    const queryReduced = () => { reducedRef.current = mql.matches || isTouch; };

    layerEls.current = Array.from(root.querySelectorAll<HTMLDivElement>('[data-depth]'));

    const onScroll = () => {
      state.current.scroll.ty = window.scrollY;
    };

    const onPointer = (e: PointerEvent) => {
      if (reducedRef.current) return;
      const rect = root.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      state.current.mouse.tx = ((e.clientX - rect.left) / w - 0.5) * 2;
      state.current.mouse.ty = ((e.clientY - rect.top) / h - 0.5) * 2;
    };

    const onReducedChange = () => {
      queryReduced();
      if (reducedRef.current) {
        // Snap to neutral
        state.current.mouse.tx = 0;
        state.current.mouse.ty = 0;
        state.current.scroll.tx = 0;
        state.current.scroll.ty = 0;
        state.current.mouse.x = 0;
        state.current.mouse.y = 0;
        state.current.scroll.x = 0;
        state.current.scroll.y = 0;
        layerEls.current.forEach((el) => { el.style.transform = ''; });
        stop();
      } else {
        start();
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reducedRef.current) start();
    };

    queryReduced();
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    if (!isTouch) window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    mql.addEventListener('change', onReducedChange);

    if (!reducedRef.current) start();

    return () => {
      stop();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      mql.removeEventListener('change', onReducedChange);
    };
  }, [start, stop]);

  return (
    <div className="spatial-background" aria-hidden="true" ref={rootRef}>
      <div className="spatial-background__layers">
        <div className="spatial-layer spatial-layer--field"   data-depth="0.05" data-idle="false" />
        <div className="spatial-layer spatial-layer--aurora"  data-depth="0.10" />
        <div className="spatial-layer spatial-layer--glow"    data-depth="0.15" />
        <div className="spatial-layer spatial-layer--orb-a"   data-depth="0.20" />
        <div className="spatial-layer spatial-layer--orb-b"   data-depth="0.12" />
        <div className="spatial-layer spatial-layer--network" data-depth="0.18" />
        <div className="spatial-layer spatial-layer--glyph"   data-depth="0.25" />
      </div>
    </div>
  );
};