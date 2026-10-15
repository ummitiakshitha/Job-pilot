import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  Calendar,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  FileCode,
  Layers,
  BookOpen,
  Mic,
  Sparkles,
  Code2,
  Flame,
  Scale,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenNewAppModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'Job Tracking',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Applications', path: '/applications', icon: Briefcase },
        { name: 'Kanban Board', path: '/applications?view=kanban', icon: Kanban },
        { name: 'Interview Calendar', path: '/calendar', icon: Calendar },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'AI Placement Prep',
      items: [
        { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
        { name: 'JD Decoder', path: '/jd-decoder', icon: FileCode },
        { name: 'Skill Gap Analyzer', path: '/skill-gap', icon: Layers },
        { name: 'Learning Roadmap', path: '/learning-plan', icon: BookOpen },
        { name: 'Interview Coach', path: '/interview-coach', icon: Mic },
        { name: 'STAR Story Builder', path: '/star-builder', icon: Sparkles },
        { name: 'Practice Lab', path: '/practice-lab', icon: Code2 },
      ],
    },
    {
      title: 'Career Insights',
      items: [
        { name: 'Career Readiness', path: '/career-readiness', icon: Compass },
        { name: 'Placement Rescue', path: '/placement-rescue', icon: Flame },
        { name: 'Company Comparison', path: '/company-comparison', icon: Scale },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Profile & Settings', path: '/profile', icon: User },
        { name: 'Landing Page', path: '/', icon: Compass },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-sand-200/90 bg-white/95 backdrop-blur-md flex flex-col justify-between shadow-soft ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between h-20 px-4 border-b border-sand-200/70 flex-shrink-0">
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
                  Placement Platform
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
          <div className="p-3 flex-shrink-0">
            <button
              onClick={onOpenNewAppModal}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl btn-forest text-xs font-semibold shadow-soft ${
                isCollapsed ? 'px-0' : ''
              }`}
              title="Track New Application"
            >
              <span className="text-base leading-none">+</span>
              {!isCollapsed && <span>Track Application</span>}
            </button>
          </div>
        )}

        {/* Navigation Sections with Scroll */}
        <nav className="p-3 space-y-4 overflow-y-auto flex-1">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">
                  {sec.title}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-forest-50 text-forest-800 font-semibold border border-forest-100/90 shadow-sm'
                          : 'text-stone-600 hover:text-forest-900 hover:bg-sand-50'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="w-3.5 h-3.5 min-w-3.5 text-forest-700/80" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-3 border-t border-sand-200/70 flex-shrink-0">
        {!isCollapsed && user && (
          <div className="p-2.5 mb-2 rounded-xl bg-ivory-100 border border-sand-200/80 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 font-bold flex items-center justify-center text-xs border border-forest-200/60">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-stone-900 truncate">{user.name}</p>
              <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5 min-w-3.5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
