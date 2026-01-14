/**
 * MainLayout Component
 * Main layout with sidebar and header
 */

import React, { useState } from 'react';
import { Sidebar, type MenuItem } from './Sidebar';
import { Header, type HeaderAction, type UserMenuAction } from './Header';

export interface MainLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  headerTitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  headerActions?: HeaderAction[];
  userMenu?: UserMenuAction[];
  userName?: string;
  userAvatar?: string;
  logo?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  menuItems,
  headerTitle,
  breadcrumbs,
  headerActions,
  userMenu,
  userName,
  userAvatar,
  logo,
  sidebarFooter,
  className = '',
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  return (
    <div className={`main-layout flex h-screen bg-gray-50 ${className}`}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          menuItems={menuItems}
          logo={logo}
          footer={sidebarFooter}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      
      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar
              menuItems={menuItems}
              logo={logo}
              footer={sidebarFooter}
            />
          </div>
        </>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={headerTitle}
          breadcrumbs={breadcrumbs}
          actions={headerActions}
          userMenu={userMenu}
          userName={userName}
          userAvatar={userAvatar}
          showMenuButton
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
