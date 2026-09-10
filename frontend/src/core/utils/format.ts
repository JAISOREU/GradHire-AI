export const currentPeriodLabel = (): string => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString(undefined, opts)} to ${now.toLocaleDateString(undefined, opts)}`;
};