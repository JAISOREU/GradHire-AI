import { useCallback, useMemo, useState } from 'react';

interface ThemeNavArrowProps {
  active: number;
  goTo: (index: number) => void;
  lastIndex: number;
  isTransitioning: React.MutableRefObject<boolean>;
  reduced: boolean;
}

export const ThemeNavArrow = ({ active, goTo, lastIndex, isTransitioning, reduced }: ThemeNavArrowProps) => {
  const [animating, setAnimating] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const { visible, direction } = useMemo(() => {
    if (active === 0) return { visible: false, direction: 'hidden' as const };
    if (active === lastIndex) return { visible: true, direction: 'up' as const };
    return { visible: true, direction: 'down' as const };
  }, [active, lastIndex]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isTransitioning.current) return;
      if (animating) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setRipple({ x, y, id: Date.now() });
      setAnimating(true);

      if (direction === 'down') {
        goTo(active + 1);
      } else if (direction === 'up') {
        goTo(0);
      }

      setTimeout(() => {
        setAnimating(false);
        setRipple(null);
      }, reduced ? 50 : 700);
    },
    [active, direction, goTo, isTransitioning, animating, reduced]
  );

  if (!visible) return null;

  const isDown = direction === 'down';
  const ariaLabel = isDown ? 'Go to next section' : 'Return to introduction';

  return (
    <button
      type="button"
      className={`theme-nav-arrow is-visible ${isDown ? 'theme-nav-arrow--down' : 'theme-nav-arrow--up'} ${animating ? 'theme-nav-arrow--animating' : ''}`}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {/* Glow ring */}
      <span className="theme-nav-arrow__glow" aria-hidden="true" />

      {/* Orbiting particles */}
      <span className="theme-nav-arrow__orbit" aria-hidden="true">
        <span className="theme-nav-arrow__dot theme-nav-arrow__dot--1" />
        <span className="theme-nav-arrow__dot theme-nav-arrow__dot--2" />
        <span className="theme-nav-arrow__dot theme-nav-arrow__dot--3" />
      </span>

      {/* Inner container */}
      <span className="theme-nav-arrow__inner" aria-hidden="true">
        {/* Arrow SVG with morphing path */}
        <svg
          className="theme-nav-arrow__svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            className="theme-nav-arrow__path"
            d={isDown ? 'M12 5v14M5 12l7 7 7-7' : 'M12 19V5M5 12l7-7 7 7'}
          />
        </svg>
      </span>

      {/* Ripple effect */}
      {ripple && (
        <span
          className="theme-nav-arrow__ripple"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: '20px',
            height: '20px',
            marginLeft: '-10px',
            marginTop: '-10px',
          }}
          key={ripple.id}
          aria-hidden="true"
        />
      )}
    </button>
  );
};

