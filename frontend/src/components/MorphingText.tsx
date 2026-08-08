import { useEffect, useState } from 'react';

type MorphingTextProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
};

export const MorphingText = ({ text, as = 'span', className = '' }: MorphingTextProps) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const words = text.split(' ');
  const Tag = as;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const elements = words.flatMap((word, index) => [
    <span key={index} className={reducedMotion ? '' : 'morph-word'} style={reducedMotion ? undefined : { animationDelay: `${index * 0.05}s` }}>
      {word}
    </span>,
    ...(index < words.length - 1 ? [' '] : []),
  ]);

  return <Tag className={className}>{elements}</Tag>;
};
