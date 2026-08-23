import { useState, useRef, useEffect, type ReactNode } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
  content: string;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
};

const POSITION_STYLES: Record<TooltipPosition, React.CSSProperties> = {
  top: {
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  bottom: {
    top: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  left: {
    right: 'calc(100% + 8px)',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  right: {
    left: 'calc(100% + 8px)',
    top: '50%',
    transform: 'translateY(-50%)',
  },
};

export const Tooltip = ({ content, children, position = 'top', delay = 300, disabled = false }: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  const show = () => {
    if (disabled) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <span
      ref={containerRef}
      className="tooltip-wrapper"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {children}
      {visible && content && (
        <span
          className="tooltip"
          role="tooltip"
          style={{
            ...POSITION_STYLES[position],
            position: 'absolute',
            zIndex: 100,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
};
