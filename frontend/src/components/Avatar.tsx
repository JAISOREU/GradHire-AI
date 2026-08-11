import { useMemo, useState } from 'react';

type AvatarProps = {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

function getInitials(name?: string, fallback?: string): string {
  const source = name || fallback || '?';
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const Avatar = ({ src, alt = '', name, initials, size = 'md', className = '' }: AvatarProps) => {
  const computedInitials = useMemo(() => getInitials(name, initials), [name, initials]);
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  const fallbackStyle = useMemo(() => {
    if (showFallback && computedInitials) {
      return { backgroundColor: stringToColor(computedInitials) };
    }
    return undefined;
  }, [showFallback, computedInitials]);

  return (
    <div
      className={`avatar avatar--${size} ${showFallback ? 'avatar--fallback' : ''} ${className}`}
      style={fallbackStyle}
      aria-label={alt || computedInitials}
    >
      {!showFallback && <img src={src} alt={alt} onError={() => setFailed(true)} />}
      {showFallback && <span>{computedInitials}</span>}
    </div>
  );
};
