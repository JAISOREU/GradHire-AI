import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PhosphorIcon, type PhosphorIconName } from './PhosphorIcon';
import type { NavSection } from '../core/utils/navigation';

type PaletteItem = {
  label: string;
  to: string;
  icon: PhosphorIconName;
  group: string;
};

type CommandPaletteProps = {
  sections: NavSection[];
};

const matchItem = (item: PaletteItem, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return item.label.toLowerCase().includes(q) || item.to.toLowerCase().includes(q);
};

export const CommandPalette = ({ sections }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = useMemo<PaletteItem[]>(
    () =>
      sections.flatMap((section) =>
        (section.items ?? []).map((item) => ({
          label: item.label,
          to: item.to,
          icon: item.icon as PhosphorIconName,
          group: section.label ?? 'Navigate',
        })),
      ),
    [sections],
  );

  const results = useMemo(() => items.filter((item) => matchItem(item, query)), [items, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((prev) => Math.min(prev + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = results[active];
      if (item) go(item.to);
    }
  };

  if (!open) return null;

  return (
    <div
      className="command-palette__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div className="command-palette" role="dialog" aria-modal="true" aria-label="Quick navigation">
        <div className="command-palette__field">
          <span className="command-palette__search-icon" aria-hidden="true">
            <PhosphorIcon name="MagnifyingGlass" size={18} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Jump to a page…"
            aria-label="Jump to a page"
          />
          <span className="command-palette__kbd">esc</span>
        </div>
        <ul className="command-palette__list" role="listbox">
          {results.length === 0 && <li className="command-palette__empty">No pages match “{query.trim()}”.</li>}
          {results.map((item, index) => (
            <li key={item.to}>
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                className={`command-palette__item ${index === active ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item.to)}
              >
                <span className="command-palette__item-icon" aria-hidden="true">
                  <PhosphorIcon name={item.icon} size={16} />
                </span>
                <span className="command-palette__item-label">{item.label}</span>
                <span className="command-palette__item-path">{item.to}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="command-palette__footer">
          <span><span className="command-palette__kbd">↑</span><span className="command-palette__kbd">↓</span> navigate</span>
          <span><span className="command-palette__kbd">↵</span> open</span>
          <span><span className="command-palette__kbd">esc</span> close</span>
        </div>
      </div>
    </div>
  );
};