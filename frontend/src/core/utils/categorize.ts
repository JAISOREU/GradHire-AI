import type { PhosphorIconName } from '../../components/PhosphorIcon';

export type Category = { tag: string; icon: PhosphorIconName };

const CATEGORY_META: Array<{ keywords: string[]; tag: string; icon: PhosphorIconName }> = [
  { keywords: ['data', 'analytics'], tag: 'Data', icon: 'ChartBar' },
  { keywords: ['ai', 'machine learning'], tag: 'Recommended', icon: 'Robot' },
  { keywords: ['design', 'product'], tag: 'Product & Design', icon: 'Palette' },
  { keywords: ['full-stack', 'full stack', 'development', 'software', 'engineer'], tag: 'Engineering', icon: 'Code' },
  { keywords: ['marketing', 'sales'], tag: 'Marketing & Sales', icon: 'Megaphone' },
  { keywords: ['finance', 'accounting'], tag: 'Finance', icon: 'Briefcase' },
  { keywords: ['hr', 'human resources'], tag: 'HR', icon: 'UserCircle' },
];

export const categorize = (title: string): Category => {
  const lower = title.toLowerCase();
  const match = CATEGORY_META.find((cat) => cat.keywords.some((k) => lower.includes(k)));
  return match ? { tag: match.tag, icon: match.icon } : { tag: 'Career', icon: 'Rocket' };
};

export const confidenceFor = (index: number): number => Math.max(0, 92 - index * 4);