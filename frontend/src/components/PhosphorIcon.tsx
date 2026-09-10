import * as PhosphorIcons from '@phosphor-icons/react';
import type { ComponentType } from 'react';

export type PhosphorIconName = keyof typeof PhosphorIcons;

export type PhosphorIconProps = {
  name: PhosphorIconName;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'fill' | 'duotone' | 'bold';
  className?: string;
};

const icons = PhosphorIcons as unknown as Record<string, ComponentType<{ size?: number; weight?: string; className?: string }>>;

export const PhosphorIcon = ({ name, size = 20, weight = 'regular', className }: PhosphorIconProps) => {
  const Component = icons[name as string];
  if (!Component) return null;
  return <Component size={size} weight={weight} className={className} aria-hidden="true" />;
};
