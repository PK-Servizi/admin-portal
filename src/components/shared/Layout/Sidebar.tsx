/**
 * Sidebar Component
 * Navigation sidebar for admin portal
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface MenuItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: MenuItem[];
}

export interface SidebarProps {
  menuItems: MenuItem[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  logo,
  footer,
  collapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  
  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const active = isActive(item.path);
    
    return (
      <div key={item.path}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.path)}
            className={`
              w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md
              ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
              ${collapsed ? 'justify-center' : ''}
            `}
            style={{ paddingLeft: collapsed ? '1rem' : `${1 + level}rem` }}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && (
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ) : (
          <Link
            to={item.path}
            className={`
              flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md
              ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
              ${collapsed ? 'justify-center' : ''}
            `}
            style={{ paddingLeft: collapsed ? '1rem' : `${1 + level}rem` }}
            title={collapsed ? item.label : undefined}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && item.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.badge}
              </span>
            )}
          </Link>
        )}
        
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div
      className={`
        sidebar flex flex-col h-screen bg-white border-r border-gray-200
        ${collapsed ? 'w-16' : 'w-64'}
        transition-all duration-300
        ${className}
      `}
    >
      {/* Logo */}
      {logo && (
        <div className={`sidebar-logo border-b border-gray-200 px-4 py-4 ${collapsed ? 'px-2' : ''}`}>
          {logo}
        </div>
      )}
      
      {/* Toggle button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute top-4 -right-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50"
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
      
      {/* Footer */}
      {footer && !collapsed && (
        <div className="sidebar-footer border-t border-gray-200 px-4 py-4">
          {footer}
        </div>
      )}
    </div>
  );
};
