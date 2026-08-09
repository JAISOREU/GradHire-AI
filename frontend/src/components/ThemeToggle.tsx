import { useTheme } from '../core/theme/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.75rem',
        lineHeight: 1,
        padding: '0.125rem',
        color: 'var(--color-text-tertiary)',
      }}
    >
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  );
};
