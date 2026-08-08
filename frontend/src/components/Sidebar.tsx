import { NavLink } from 'react-router-dom';
import type { NavItem } from '../core/utils/navigation';

type SidebarProps = {
  items: NavItem[];
  title: string;
  footer?: React.ReactNode;
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
};

export const Sidebar = ({ items, title, footer, className, collapsed, onToggle }: SidebarProps) => (
  <aside className={`sidebar ${className ?? ''} ${collapsed ? 'is-collapsed' : ''}`}>
    <div className="sidebar__head">
      {!collapsed && <span>{title}</span>}
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="sidebar__toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-text-muted)', padding: '0.25rem' }}
        >
          {collapsed ? '→' : '←'}
        </button>
      )}
    </div>
    <nav className="sidebar__nav" aria-label={title}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
          title={collapsed ? item.label : undefined}
        >
          <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      ))}
    </nav>
    {footer && !collapsed && <div className="sidebar__footer">{footer}</div>}
  </aside>
);
