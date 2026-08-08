import { useEffect, useState } from 'react';
import { Icon } from './Icon';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle theme"
      aria-pressed={isDark}
    >
      <span className="theme-toggle__bg" aria-hidden="true" />
      <span className={`theme-toggle__icon-wrap ${isDark ? 'theme-toggle__icon-wrap--dark' : ''}`}>
        {isDark ? (
          <Icon name="sun" size={22} className="theme-toggle__svg" />
        ) : (
          <Icon name="moon" size={22} className="theme-toggle__svg" />
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
