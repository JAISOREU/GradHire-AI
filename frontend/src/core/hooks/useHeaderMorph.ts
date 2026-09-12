import { useEffect, useRef, useState } from 'react';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const lerp = (start: number, end: number, progress: number) => start + (end - start) * progress;

const isDesktopDevice = () => {
  if (typeof navigator === 'undefined') return true;
  const ua = navigator.userAgent || '';
  const touchSupport = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
  const mobileOrTablet = /android|iPad|iPhone|iPod|webOS/i.test(ua);
  return !(touchSupport && mobileOrTablet);
};

export const useHeaderMorph = (enabled = true) => {
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return (document.documentElement.dataset.theme as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const ticking = useRef(false);
  const reducedMotion = useRef(false);
  const desktop = useRef(isDesktopDevice());

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    desktop.current = isDesktopDevice();
  });

  useEffect(() => {
    if (!enabled || reducedMotion.current || desktop.current) return;

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const maxScroll = 200;
          const raw = window.scrollY / maxScroll;
          const next = clamp(raw, 0, 1);
          setProgress((prev) => {
            if (Math.abs(prev - next) < 0.001) return prev;
            return next;
          });
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      const t = document.documentElement.dataset.theme as 'light' | 'dark';
      if (t === 'light' || t === 'dark') setTheme(t);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const p = reducedMotion.current || desktop.current ? 0 : progress;

  const height = enabled && !desktop.current ? lerp(64, 48, p) : 64;
  const borderRadius = enabled && !desktop.current ? lerp(0, 9999, p) : 0;
  const paddingX = enabled && !desktop.current ? lerp(24, 16, p) : 24;
  const backgroundOpacity = enabled && !desktop.current ? lerp(1, theme === 'dark' ? 0.8 : 0.85, p) : 1;
  const borderOpacity = enabled && !desktop.current ? lerp(0, theme === 'dark' ? 0.2 : 0.12, p) : 0;
  const shadowOpacity = enabled && !desktop.current ? lerp(0, theme === 'dark' ? 0.12 : 0.08, p) : 0;

  const groupGap = enabled && !desktop.current ? lerp(16, 8, p) : 16;
  const itemGap = enabled && !desktop.current ? lerp(12, 8, p) : 12;

  const logoScale = enabled && !desktop.current ? lerp(1, 0.85, p) : 1;
  const titleOpacity = 1;
  const titleScale = enabled && !desktop.current ? lerp(1, 0.92, p) : 1;

  const navOpacity = enabled && !desktop.current ? lerp(1, 0, clamp(p * 2.5, 0, 1)) : 1;
  const navFlex = enabled && !desktop.current ? lerp(1, 0, clamp(p * 2.5, 0, 1)) : 1;
  const navPadding = enabled && !desktop.current ? lerp(16, 0, clamp(p * 3, 0, 1)) : 16;
  const navGap = enabled && !desktop.current ? lerp(16, 0, clamp(p * 2.5, 0, 1)) : 16;

  const userOpacity = enabled && !desktop.current ? lerp(1, 1, p) : 1;
  const avatarScale = enabled && !desktop.current ? lerp(1, 0.85, p) : 1;
  const metaOpacity = 1;

  const themeOpacity = 1;

  const brandMargin = enabled && !desktop.current ? lerp(0, 4, p) : 0;
  const userMargin = enabled && !desktop.current ? lerp(4, 4, p) : 4;

  const isMorphed = enabled && !desktop.current ? p >= 0.5 : false;

  const surfaceColor = theme === 'dark' ? '10, 15, 30' : '255, 255, 255';
  const borderColor = theme === 'dark' ? '30, 42, 58' : '232, 226, 216';
  const shadowColor = theme === 'dark' ? '0, 0, 0' : '26, 24, 20';

  return {
    progress: p,
    theme,
    height,
    borderRadius,
    paddingX,
    backgroundOpacity,
    borderOpacity,
    shadowOpacity,
    groupGap,
    itemGap,
    logoScale,
    titleOpacity,
    titleScale,
    navOpacity,
    navFlex,
    navPadding,
    navGap,
    userOpacity,
    avatarScale,
    metaOpacity,
    themeOpacity,
    brandMargin,
    userMargin,
    isMorphed,
    reducedMotion: reducedMotion.current,
    surfaceColor,
    borderColor,
    shadowColor,
  };
};
