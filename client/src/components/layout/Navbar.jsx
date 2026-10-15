import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, User, LogOut, Menu, Sun, Moon } from 'lucide-react';

export const Navbar = ({ onOpenNewAppModal, onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('jobpilot-theme') === 'dark';
  });
  const navigate = useNavigate();

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jobpilot-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jobpilot-theme', 'light');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/applications?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/applications');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-ivory-100/90 backdrop-blur-md border-b border-sand-200/90 px-4 md:px-8 flex items-center justify-between">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-sand-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search applications by company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm clean-input placeholder-stone-400"
          />
        </form>
      </div>

      {/* Right Action Icons & User Dropdown */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-sand-100 border border-transparent hover:border-sand-200 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-forest-800" />}
        </button>

        {onOpenNewAppModal && (
          <button
            onClick={onOpenNewAppModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-forest text-sm font-semibold shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Track Application</span>
          </button>
        )}

        {/* User Profile Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-sand-100 border border-transparent hover:border-sand-200 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-forest-800 text-ivory-50 flex items-center justify-center font-bold text-sm shadow-soft">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-sm font-semibold text-stone-800 hidden lg:inline max-w-[120px] truncate">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-sand-200 shadow-modal py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-sand-100">
                <p className="text-sm font-semibold text-stone-900 truncate">{user?.name}</p>
                <p className="text-xs text-stone-500 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:text-stone-900 hover:bg-sand-50"
                >
                  <User className="w-4 h-4 text-forest-700" />
                  <span>Profile & Settings</span>
                </button>
              </div>

              <div className="pt-1 border-t border-sand-100">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
