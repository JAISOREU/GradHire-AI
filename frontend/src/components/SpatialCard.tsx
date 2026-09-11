import { useRef, type ReactNode } from 'react';
import { cn } from '../lib/utils';

type SpatialCardProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export const SpatialCard = ({ className, children, onClick }: SpatialCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/50 bg-surface p-5',
        'shadow-[var(--space-depth-md)] transition-all duration-300',
        'hover:shadow-[var(--space-depth-lg)] hover:-translate-y-0.5',
        'hover:border-primary/20',
        'before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300',
        'before:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(99,102,241,0.06),transparent_60%)]',
        'hover:before:opacity-100',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};