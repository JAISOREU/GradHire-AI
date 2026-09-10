import { NavLink } from 'react-router-dom';
import type { NavItem, NavSection } from '../core/utils/navigation';
import { AnimatedLogo } from './AnimatedLogo';
import { PhosphorIcon } from './PhosphorIcon';

type SidebarProps = {
  sections?: NavSection[];
  items?: NavItem[];
  title: string;
  footer?: React.ReactNode;
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
};

const SidebarIcon = ({ name, size = 20, weight = 'regular' }: { name: NavItem['icon']; size?: number; weight?: 'regular' | 'bold' | 'light' | 'duotone' | 'fill' | 'thin' }) => {
  return <PhosphorIcon name={name} size={size} weight={weight} className="sidebar__icon" />;
};

export const Sidebar = ({ sections, items, title, footer, className, collapsed, onToggle }: SidebarProps) => (
  <aside className={`sidebar ${className ?? ''} ${collapsed ? 'is-collapsed' : ''}`} aria-label={title}>
    <div className="sidebar__head">
      {onToggle ? (
        <button
          type="button"
          className="sidebar__brand"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <AnimatedLogo size={24} showText />
        </button>
      ) : (
        <div className="sidebar__brand">
          <AnimatedLogo size={24} showText />
        </div>
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
                  <SidebarIcon name={item.icon} />
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
              <SidebarIcon name={item.icon} />
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          ))}
    </nav>
    {footer && <div className="sidebar__footer">{footer}</div>}
  </aside>
);
