/**
 * Activity Feed Component
 * Display timeline of activities
 */

import React from 'react';
import { Card } from './Card';

export interface Activity {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  action?: React.ReactNode;
}

export interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  loading?: boolean;
  emptyMessage?: string;
  showDividers?: boolean;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'Recent Activity',
  loading = false,
  emptyMessage = 'No recent activity',
  showDividers = true,
  className = '',
}) => {
  if (loading) {
    return (
      <Card className={className} title={title} padding="md">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
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
    <Card className={className} title={title} padding="none">
      {activities.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="flow-root px-6 py-4">
          <ul className={showDividers ? '-mb-8' : ''}>
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {showDividers && index < activities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      {activity.icon ? (
                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white text-blue-600">
                          {activity.icon}
                        </span>
                      ) : activity.user?.avatar ? (
                        <img
                          className="h-8 w-8 rounded-full ring-8 ring-white"
                          src={activity.user.avatar}
                          alt={activity.user.name}
                        />
                      ) : (
                        <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center ring-8 ring-white text-white font-medium">
                          {activity.user?.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">{activity.title}</p>
                        {activity.description && (
                          <p className="mt-0.5 text-sm text-gray-500">{activity.description}</p>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time>{activity.timestamp}</time>
                      </div>
                    </div>
                    {activity.action && <div>{activity.action}</div>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
