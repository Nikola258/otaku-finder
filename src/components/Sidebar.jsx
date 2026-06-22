import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import '../css/Sidebar.css';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { session } = useSession();

  useEffect(() => {
    if (!session) return;
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => setIsAdmin(data?.is_admin ?? false));
  }, [session]);

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Search', to: '/search' },
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
        {!collapsed && isAdmin && (
          <Link to="/admin" className={`sidebar__link ${location.pathname === '/admin' ? 'sidebar__link--active' : ''}`}>
            Admin
          </Link>
        )}
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
