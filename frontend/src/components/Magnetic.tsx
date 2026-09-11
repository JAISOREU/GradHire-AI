import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';

interface MagneticProps {
  children: ReactNode;
  /** How strongly the element is pulled toward the cursor (0–1). */
  strength?: number;
  className?: string;
}

/**
 * Magnetic
 * --------
 * Gently pulls a child (typically a call-to-action) a few pixels toward the
 * cursor while hovered, and springs it back on leave. Uses a single rAF while
 * the pointer is over the element (no per-frame React state), is disabled on
 * touch / coarse pointers and under prefers-reduced-motion, and the child
 * only gets a scale bump from CSS — real navigation happens on the button.
 */
export const Magnetic = ({ children, strength = 0.3, className = '' }: MagneticProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const state = useRef<{
    x: number;
    y: number;
    tx: number;
    ty: number;
    enabled: boolean;
    reduced: boolean;
    raf: number | null;
  }>({ x: 0, y: 0, tx: 0, ty: 0, enabled: false, reduced: false, raf: null });

  useEffect(() => {
    const st = state.current;
    st.enabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    st.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      st.reduced = e.matches;
      if (e.matches) {
        if (st.raf !== null) window.cancelAnimationFrame(st.raf);
        st.raf = null;
        st.x = st.y = st.tx = st.ty = 0;
        const el = wrapRef.current;
        if (el) el.style.transform = 'translate3d(0, 0, 0)';
      }
    };
    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      if (st.raf !== null) window.cancelAnimationFrame(st.raf);
    };
  }, []);

  const start = () => {
    const st = state.current;
    if (st.reduced || !st.enabled || st.raf !== null) return;
    const loop = () => {
      const s = state.current;
      if (s.reduced || !s.enabled) return;
      const ease = 1 - Math.exp(-10 * 0.016);
      s.x += (s.tx - s.x) * ease;
      s.y += (s.ty - s.y) * ease;
      const el = wrapRef.current;
      if (el) el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
      if (Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05) {
        s.raf = null;
        return;
      }
      s.raf = window.requestAnimationFrame(loop);
    };
    st.raf = window.requestAnimationFrame(loop);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const st = state.current;
    if (st.reduced || !st.enabled) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    st.tx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    st.ty = (e.clientY - (rect.top + rect.height / 2)) * strength;
    start();
  };

  const onLeave = () => {
    const st = state.current;
    st.tx = 0;
    st.ty = 0;
    start();
  };

  return (
    <div
      className={`magnetic ${className}`.trim()}
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
};