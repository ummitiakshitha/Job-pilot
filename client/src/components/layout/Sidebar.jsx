import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenNewAppModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Applications', path: '/applications', icon: Briefcase },
    { name: 'Kanban Board', path: '/applications?view=kanban', icon: Kanban },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Profile & Settings', path: '/profile', icon: User },
    { name: 'Landing Page', path: '/', icon: Compass },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-sand-200/90 bg-white/95 backdrop-blur-md flex flex-col justify-between shadow-soft ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between h-20 px-4 border-b border-sand-200/70">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden" title="View Opening Landing Page">
            <div className="w-10 h-10 min-w-10 rounded-xl bg-forest-800 flex items-center justify-center text-white shadow-soft">
              <Compass className="w-5 h-5 text-ivory-50" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-forest-950 font-sans">
                  Job<span className="text-forest-600">Pilot</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  Application Tracker
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-forest-900 hover:bg-sand-100 transition-colors hidden md:block"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Button */}
        {onOpenNewAppModal && (
          <div className="p-3">
            <button
              onClick={onOpenNewAppModal}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl btn-forest text-sm font-semibold shadow-soft ${
                isCollapsed ? 'px-0' : ''
              }`}
              title="Track New Application"
            >
              <span className="text-lg leading-none">+</span>
              {!isCollapsed && <span>Track Application</span>}
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-forest-50 text-forest-800 font-semibold border border-forest-100/90 shadow-sm'
                      : 'text-stone-600 hover:text-forest-900 hover:bg-sand-50'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 min-w-4 text-forest-700/80" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-3 border-t border-sand-200/70">
        {!isCollapsed && user && (
          <div className="p-3 mb-2 rounded-xl bg-ivory-100 border border-sand-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-forest-100 text-forest-800 font-bold flex items-center justify-center text-sm border border-forest-200/60">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-stone-900 truncate">{user.name}</p>
              <p className="text-xs text-stone-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-600 hover:text-rose-700 hover:bg-rose-50 text-sm font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 min-w-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
