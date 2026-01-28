/**
 * Admin Sidebar Component
 * Modern, aesthetic sidebar with gradient effects and smooth animations
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebarCollapsed } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CreditCard,
  Calendar,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  BookOpen,
  Newspaper,
  History,
  HelpCircle,
  Sparkles,
  Layers,
  Briefcase,
} from 'lucide-react';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/dashboard',
  },
  {
    key: 'users',
    label: 'Users',
    icon: <Users className="h-5 w-5" />,
    path: '/users',
  },
  {
    key: 'service-types',
    label: 'Tipi di Servizio',
    icon: <Layers className="h-5 w-5" />,
    path: '/service-types',
  },
  {
    key: 'services',
    label: 'Servizi',
    icon: <Briefcase className="h-5 w-5" />,
    path: '/services',
  },
  {
    key: 'service-requests',
    label: 'Service Requests',
    icon: <ClipboardList className="h-5 w-5" />,
    path: '/service-requests',
  },
  {
    key: 'subscriptions',
    label: 'Subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
    path: '/subscriptions',
  },
  {
    key: 'appointments',
    label: 'Appointments',
    icon: <Calendar className="h-5 w-5" />,
    path: '/appointments',
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: <Receipt className="h-5 w-5" />,
    path: '/payments',
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: <FileText className="h-5 w-5" />,
    path: '/documents',
  },
  {
    key: 'cms',
    label: 'CMS',
    icon: <Newspaper className="h-5 w-5" />,
    path: '/cms',
  },
  {
    key: 'courses',
    label: 'Courses',
    icon: <BookOpen className="h-5 w-5" />,
    path: '/courses',
  },
  {
    key: 'roles',
    label: 'Roles & Permissions',
    icon: <Shield className="h-5 w-5" />,
    path: '/roles',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <BarChart3 className="h-5 w-5" />,
    path: '/reports',
  },
  {
    key: 'audit',
    label: 'Audit Logs',
    icon: <History className="h-5 w-5" />,
    path: '/audit',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    path: '/settings',
  },
];

interface AdminSidebarProps {
  onLogout: () => void;
  notificationCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  onLogout,
  notificationCount = 0,
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  const handleToggle = () => {
    dispatch(toggleSidebarCollapsed());
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen flex flex-col',
          'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900',
          'text-slate-100 shadow-2xl',
          'transition-all duration-300 ease-out',
          isCollapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 pointer-events-none" />
        
        {/* Logo Area */}
        <div
          className={cn(
            'relative flex items-center h-18 px-5 border-b border-white/5',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  PK Servizi
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                  Admin Panel
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={cn(
            'absolute -right-3 top-[4.5rem] z-50',
            'w-6 h-6 rounded-full',
            'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30',
            'flex items-center justify-center',
            'hover:shadow-glow hover:scale-110 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-white" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-white" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
          <div className={cn(!isCollapsed && 'mb-2 px-3')}>
            {!isCollapsed && (
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Main Menu
              </span>
            )}
          </div>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const menuLink = (
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                    'transition-all duration-200 group relative',
                    active
                      ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-white shadow-lg shadow-indigo-500/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-violet-400 rounded-r-full shadow-glow" />
                  )}
                  
                  <span
                    className={cn(
                      'flex-shrink-0 transition-colors duration-200',
                      active 
                        ? 'text-indigo-400' 
                        : 'text-slate-500 group-hover:text-indigo-400'
                    )}
                  >
                    {item.icon}
                  </span>
                  
                  {!isCollapsed && (
                    <span className="font-medium text-sm truncate">{item.label}</span>
                  )}
                  
                  {item.badge && item.badge > 0 && (
                    <span
                      className={cn(
                        'bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg',
                        isCollapsed
                          ? 'absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px]'
                          : 'ml-auto px-2 py-0.5 min-w-[20px] text-center'
                      )}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );

              return (
                <li key={item.key}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{menuLink}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    menuLink
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="relative border-t border-white/5 p-3 space-y-1">
          {/* Decorative glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          {/* Notifications */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/notifications"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white group relative"
                >
                  <span className="flex-shrink-0 relative">
                    <Bell className="h-5 w-5 group-hover:text-indigo-400 transition-colors" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Notifications
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              to="/notifications"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white group"
            >
              <span className="flex-shrink-0 relative">
                <Bell className="h-5 w-5 group-hover:text-indigo-400 transition-colors" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </span>
              <span className="font-medium text-sm">Notifications</span>
              {notificationCount > 0 && (
                <span className="ml-auto text-xs text-slate-500">{notificationCount} new</span>
              )}
            </Link>
          )}

          {/* Help */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/help"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white group"
                >
                  <HelpCircle className="h-5 w-5 flex-shrink-0 group-hover:text-indigo-400 transition-colors" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Help & Support
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              to="/help"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white group"
            >
              <HelpCircle className="h-5 w-5 flex-shrink-0 group-hover:text-indigo-400 transition-colors" />
              <span className="font-medium text-sm">Help & Support</span>
            </Link>
          )}

          {/* Logout */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 group"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 group"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AdminSidebar;
