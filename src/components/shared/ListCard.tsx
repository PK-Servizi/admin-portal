/**
 * List Card Component
 * Card for displaying lists of items
 */

import React from 'react';
import { Card } from './Card';

export interface ListItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string | React.ReactNode;
  action?: React.ReactNode;
}

export interface ListCardProps {
  title: string;
  items: ListItem[];
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (item: ListItem) => void;
  headerActions?: React.ReactNode;
  className?: string;
}

export const ListCard: React.FC<ListCardProps> = ({
  title,
  items,
  loading = false,
  emptyMessage = 'No items',
  onItemClick,
  headerActions,
  className = '',
}) => {
  if (loading) {
    return (
      <Card className={className} title={title}>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={className} title={title} headerActions={headerActions} padding="none">
      {items.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li
              key={item.id}
              className={`px-6 py-4 ${onItemClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
              onClick={() => onItemClick?.(item)}
            >
              <div className="flex items-center gap-4">
                {item.icon && (
                  <div className="flex-shrink-0 text-gray-400">{item.icon}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                  )}
                </div>
                {item.value && (
                  <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                    {item.value}
                  </div>
                )}
                {item.action && <div className="flex-shrink-0">{item.action}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
