import { useTheme } from '../core/theme/ThemeContext';
import { Icon } from './Icon';

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
      <span className={`theme-toggle__icon-wrap ${isDark ? 'theme-toggle__icon-wrap--dark' : ''}`}>
        {isDark ? (
          <Icon name="sun" size={16} className="theme-toggle__svg" />
        ) : (
          <Icon name="moon" size={16} className="theme-toggle__svg" />
        )}
      </span>
      <span className="theme-toggle__stars" aria-hidden="true">
        <span className="theme-toggle__star theme-toggle__star--1" />
        <span className="theme-toggle__star theme-toggle__star--2" />
        <span className="theme-toggle__star theme-toggle__star--3" />
      </span>
    </button>
  );
};
