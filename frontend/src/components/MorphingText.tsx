type MorphingTextProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
};

export const MorphingText = ({ text, as = 'span', className = '' }: MorphingTextProps) => {
  const words = text.split(' ');
  const Tag = as;

  const elements = words.flatMap((word, index) => [
    <span key={index} className="morph-word" style={{ animationDelay: `${index * 0.05}s` }}>
      {word}
    </span>,
    ...(index < words.length - 1 ? [' '] : []),
  ]);

  return <Tag className={className}>{elements}</Tag>;
};
