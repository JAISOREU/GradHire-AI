import { useTheme } from '../core/theme/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${isTransitioning ? 'theme-toggle--transitioning' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__bg" aria-hidden="true" />
      <span className="theme-toggle__icon-wrap" aria-hidden="true">
        <span className="theme-toggle__sun" />
      </span>
      <span className="sr-only">{isDark ? 'Light' : 'Dark'} mode</span>
    </button>
  );
};
