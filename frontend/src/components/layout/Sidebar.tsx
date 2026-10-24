import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  UserCheck,
  PlusCircle,
  BarChart3,
  Bell,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  FolderKanban,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-full select-none">
      {/* Brand Logo & Title */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base text-slate-900 tracking-tight block leading-tight">
            IssueFlow
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Enterprise Management</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Core Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Overview
          </div>
          <NavLink to="/" className={navItemClass} onClick={onCloseMobile} end>
            <LayoutDashboard className="w-4 h-4 text-indigo-500" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/issues" className={navItemClass} onClick={onCloseMobile} end>
            <Layers className="w-4 h-4 text-blue-500" />
            <span>All Issues</span>
          </NavLink>
          <NavLink to="/my-issues" className={navItemClass} onClick={onCloseMobile}>
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>My Issues</span>
          </NavLink>
          <NavLink to="/issues/new" className={navItemClass} onClick={onCloseMobile}>
            <PlusCircle className="w-4 h-4 text-violet-500" />
            <span>Report Issue</span>
          </NavLink>
        </div>

        {/* Analytics & Alerts */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Insights
          </div>
          <NavLink to="/reports" className={navItemClass} onClick={onCloseMobile}>
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span>Reports & Analytics</span>
          </NavLink>
          <NavLink to="/notifications" className={navItemClass} onClick={onCloseMobile}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-rose-500" />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </NavLink>
        </div>

        {/* Administration Section (Role-based) */}
        {(isAdmin || isManager) && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Management
            </div>
            {isAdmin && (
              <NavLink to="/users" className={navItemClass} onClick={onCloseMobile}>
                <Users className="w-4 h-4 text-sky-500" />
                <span>User Management</span>
              </NavLink>
            )}
            <NavLink to="/teams" className={navItemClass} onClick={onCloseMobile}>
              <FolderKanban className="w-4 h-4 text-teal-500" />
              <span>Team Management</span>
            </NavLink>
            {isAdmin && (
              <NavLink to="/categories" className={navItemClass} onClick={onCloseMobile}>
                <Tag className="w-4 h-4 text-orange-500" />
                <span>Categories & SLA</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/settings" className={navItemClass} onClick={onCloseMobile}>
                <Settings className="w-4 h-4 text-slate-500" />
                <span>System Settings</span>
              </NavLink>
            )}
          </div>
        )}
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden group flex-1"
          >
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  user?.name || 'User'
                )}`
              }
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-indigo-400 transition-all flex-shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                {user?.name}
              </p>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                {user?.role}
              </span>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
