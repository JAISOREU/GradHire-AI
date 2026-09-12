type MorphingTextProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
};

/**
 * MorphingText — neutralized per design system.
 * Renders static text with no animation.
 */
export const MorphingText = ({ text, as: Tag = 'span', className = '' }: MorphingTextProps) => (
  <Tag className={className}>{text}</Tag>
);