import { NavLink } from 'react-router-dom';
import type { NavItem, NavSection } from '../core/utils/navigation';
import { Icon } from './Icon';

type SidebarProps = {
  sections?: NavSection[];
  items?: NavItem[];
  title: string;
  footer?: React.ReactNode;
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
};

export const Sidebar = ({ sections, items, title, footer, className, collapsed, onToggle }: SidebarProps) => (
  <aside className={`sidebar ${className ?? ''} ${collapsed ? 'is-collapsed' : ''}`} aria-label={title}>
    <div className="sidebar__head">
      <span className="sidebar__head-text">{title}</span>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="sidebar__toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className={`sidebar__toggle-icon ${collapsed ? 'sidebar__toggle-icon--collapsed' : ''}`} aria-hidden="true">
            <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={20} />
          </span>
        </button>
      )}
    </div>
    <nav className="sidebar__nav" aria-label={`${title} navigation`}>
      {sections
        ? sections.map((section, idx) => (
            <div key={idx} className="sidebar__section">
              {section.label && <div className="sidebar__section-label">{section.label}</div>}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
                  data-tooltip={item.label}
                  aria-label={item.label}
                  title={item.label}
                >
                  <span className="sidebar__icon" aria-hidden="true">
                    <Icon name={item.icon as any} size={22} />
                  </span>
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))
        : items?.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
              data-tooltip={item.label}
              aria-label={item.label}
              title={item.label}
            >
              <span className="sidebar__icon" aria-hidden="true">
                <Icon name={item.icon as any} size={22} />
              </span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          ))}
    </nav>
    {footer && <div className="sidebar__footer">{footer}</div>}
  </aside>
);
