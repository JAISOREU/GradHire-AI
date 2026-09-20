import { useMemo, useState } from 'react';
import { cn } from '../lib/utils';
import { getProfileMediaVersion } from '../lib/profileMediaVersion';

type AvatarProps = {
  src?: string | null;
  alt?: string;
  name?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  userId?: string;
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

function resolveAvatarSrc(src?: string | null, userId?: string): string | undefined {
  if (!src) return undefined;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  if (userId) return `/api/v1/users/avatar/${encodeURIComponent(userId)}?v=${getProfileMediaVersion()}`;
  return src;
}

const SIZE_CLASSES: Record<string, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export const Avatar = ({ src, alt = '', name, initials, size = 'md', userId, className = '' }: AvatarProps) => {
  const computedInitials = useMemo(() => getInitials(name, initials), [name, initials]);
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveAvatarSrc(src, userId);
  const showFallback = !resolvedSrc || failed;

  const fallbackStyle = useMemo(() => {
    if (showFallback && computedInitials) {
      return { backgroundColor: stringToColor(computedInitials) };
    }
    return undefined;
  }, [showFallback, computedInitials]);

  return (
    <div
      className={cn('overflow-hidden rounded-full bg-surface-muted', SIZE_CLASSES[size], showFallback && 'flex items-center justify-center text-white', className)}
      style={fallbackStyle}
      aria-label={alt || computedInitials}
    >
      {!showFallback && <img src={resolvedSrc} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover" />}
      {showFallback && <span className="font-medium">{computedInitials}</span>}
    </div>
  );
};
