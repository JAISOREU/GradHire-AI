export type Category = { tag: string; icon: string };

const CATEGORY_META: Array<{ keywords: string[]; tag: string; icon: string }> = [
  { keywords: ['data', 'analytics'], tag: 'Data', icon: '📊' },
  { keywords: ['ai', 'machine learning'], tag: 'Recommended', icon: '🤖' },
  { keywords: ['design', 'product'], tag: 'Product & Design', icon: '🎨' },
  { keywords: ['full-stack', 'full stack', 'development', 'software', 'engineer'], tag: 'Engineering', icon: '💻' },
  { keywords: ['marketing', 'sales'], tag: 'Marketing & Sales', icon: '📣' },
  { keywords: ['finance', 'accounting'], tag: 'Finance', icon: '💼' },
  { keywords: ['hr', 'human resources'], tag: 'HR', icon: '🧑‍💼' },
];

export const categorize = (title: string): Category => {
  const lower = title.toLowerCase();
  const match = CATEGORY_META.find((cat) => cat.keywords.some((k) => lower.includes(k)));
  return match ? { tag: match.tag, icon: match.icon } : { tag: 'Career', icon: '🚀' };
};

export const confidenceFor = (index: number): number => Math.max(0, 92 - index * 4);
