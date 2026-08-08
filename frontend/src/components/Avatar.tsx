import { useState } from 'react';

type AvatarProps = {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export const Avatar = ({ src, alt = '', initials = '?', size = 'md', className = '' }: AvatarProps) => {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div className={`avatar avatar--${size} ${showFallback ? 'avatar--fallback' : ''} ${className}`} aria-label={alt || initials}>
      {!showFallback && <img src={src} alt={alt} onError={() => setFailed(true)} />}
      {showFallback && <span>{initials}</span>}
    </div>
  );
};
