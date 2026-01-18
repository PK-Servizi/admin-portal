/**
 * Admin Header Component
 * Modern header with glass effect, search, notifications, and user menu
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  Menu,
  Command,
  Sparkles,
  Clock,
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark' | 'system';
  notificationCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileSidebar,
  onLogout,
  onToggleTheme,
  theme,
  notificationCount = 0,
}) => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Get user display info
  const userFullName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const userInitials = userFullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';
  const userRole = typeof user?.role === 'object' ? user.role.name : (user?.role || 'Admin');

  return (
    <header className={cn(
      'sticky top-0 z-30 h-16',
      'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md',
      'border-b border-slate-200/50 dark:border-slate-800/50',
      'transition-all duration-200'
    )}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileSidebar}
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-12 h-10',
                  'bg-slate-100/50 dark:bg-slate-800/50',
                  'border-slate-200/50 dark:border-slate-700/50',
                  'focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'rounded-xl transition-all duration-200'
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-slate-400">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className={cn(
              'h-9 w-9 rounded-xl',
              'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'relative h-9 w-9 rounded-xl',
                  'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                  'hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-soft-lg border-slate-200/50 dark:border-slate-700/50">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span className="font-semibold">Notifications</span>
                {notificationCount > 0 && (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                    {notificationCount} new
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notificationCount === 0 ? (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Bell className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {/* Sample notification */}
                    <DropdownMenuItem asChild className="cursor-pointer px-3 py-3">
                      <Link to="/notifications" className="flex gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            New service request submitted
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> 2 minutes ago
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer justify-center">
                <Link to="/notifications" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'flex items-center gap-2 h-10 px-2 rounded-xl',
                  'hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-800 shadow-md">
                  <AvatarImage src={user?.avatarUrl} alt={userFullName} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                    {userFullName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize leading-tight">
                    {userRole}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-soft-lg border-slate-200/50 dark:border-slate-700/50">
              <DropdownMenuLabel className="font-normal md:hidden">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userFullName}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem asChild className="cursor-pointer gap-3 py-2.5">
                <Link to="/profile">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer gap-3 py-2.5">
                <Link to="/settings">
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer gap-3 py-2.5 text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
