/**
 * Tabs Component
 * Reusable tabs for content switching
 */

import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'default',
  className = '',
}) => {
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(
    defaultTab || tabs[0]?.id
  );
  
  const activeTab = controlledActiveTab ?? uncontrolledActiveTab;
  
  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.disabled) return;
    
    setUncontrolledActiveTab(tabId);
    onChange?.(tabId);
  };
  
  const variantClasses = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'border-b-2 px-4 py-2',
      active: 'border-blue-600 text-blue-600',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
      container: 'bg-gray-100 rounded-lg p-1',
      tab: 'rounded-md px-4 py-2',
      active: 'bg-white text-blue-600 shadow-sm',
      inactive: 'text-gray-500 hover:text-gray-700',
    },
    underline: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-2',
      active: 'text-blue-600 border-b-2 border-blue-600',
      inactive: 'text-gray-500 hover:text-gray-700',
    },
  };
  
  const classes = variantClasses[variant];
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;
  
  return (
    <div className={`tabs ${className}`}>
      <div className={`tabs-header flex gap-1 ${classes.container}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
            className={`
              ${classes.tab}
              ${activeTab === tab.id ? classes.active : classes.inactive}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              transition-all duration-200 font-medium text-sm
              flex items-center gap-2
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {activeTabContent && (
        <div className="tabs-content mt-4">{activeTabContent}</div>
      )}
    </div>
  );
};
