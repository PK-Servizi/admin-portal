/**
 * Header Component
 * Top navigation bar with user menu and actions
 */

import React, { useState } from 'react';

export interface HeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  badge?: string | number;
}

export interface UserMenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
}

export interface HeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  actions?: HeaderAction[];
  userMenu?: UserMenuAction[];
  userName?: string;
  userAvatar?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  breadcrumbs,
  actions = [],
  userMenu = [],
  userName,
  userAvatar,
  onMenuClick,
  showMenuButton = false,
  className = '',
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <header className={`header bg-white border-b border-gray-200 ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {showMenuButton && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {/* Title and breadcrumbs */}
          <div>
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {crumb.path ? (
                      <a href={crumb.path} className="text-gray-600 hover:text-gray-900">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-gray-900 font-medium">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            ) : title ? (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            ) : null}
          </div>
        </div>
        
        {/* Actions and user menu */}
        <div className="flex items-center gap-3">
          {/* Header actions */}
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title={action.label}
            >
              {action.icon}
              {action.badge && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
          
          {/* User menu */}
          {userName && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium">{userName}</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {userMenu.map((item, index) => (
                      <React.Fragment key={index}>
                        {item.divider && <div className="border-t border-gray-200 my-1" />}
                        <button
                          onClick={() => {
                            item.onClick();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
