import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Sidebar.css';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Search', to: '/search' },
    { label: 'Favorites', to: '/favorites' },
    { label: 'Friends', to: '/friends' },
  ];

  const onProfile = location.pathname === '/profile';

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        {!collapsed && (
          <Link to="/profile" className={`sidebar__title ${onProfile ? 'sidebar__title--active' : ''}`}>
            Profile
          </Link>
        )}
      </div>

      <nav className="sidebar__nav">
        {!collapsed &&
          links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar__link ${location.pathname === link.to ? 'sidebar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
      </nav>

      <button
        className="sidebar__toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}

export default Sidebar;
