import { NavLink } from 'react-router-dom';
import type { NavItem } from '../core/utils/navigation';
import { Icon } from './Icon';

type SidebarProps = {
  items?: NavItem[];
  sections?: { label?: string; items: NavItem[] }[];
  title: string;
  footer?: React.ReactNode;
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
};

export const Sidebar = ({ items, sections, title, footer, className, collapsed, onToggle }: SidebarProps) => (
  <aside className={`sidebar ${className ?? ''} ${collapsed ? 'is-collapsed' : ''}`}>
    <div className="sidebar__head">
      {!collapsed && <span className="sidebar__head-text">{title}</span>}
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="sidebar__toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        />
      )}
    </div>
    <nav className="sidebar__nav" aria-label={title}>
      {sections
        ? sections.map((section, idx) => (
            <div key={idx}>
              {section.label && !collapsed && <div className="sidebar__section">{section.label}</div>}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar__icon" aria-hidden="true"><Icon name={item.icon as any} size={18} /></span>
                  {!collapsed && <span className="sidebar__label">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))
        : items?.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar__icon" aria-hidden="true"><Icon name={item.icon as any} size={18} /></span>
              {!collapsed && <span className="sidebar__label">{item.label}</span>}
            </NavLink>
          ))}
    </nav>
    {footer && !collapsed && <div className="sidebar__footer">{footer}</div>}
  </aside>
);
