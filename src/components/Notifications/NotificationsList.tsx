/**
 * Notifications Component
 * Demonstrates real-time updates, polling, and optimistic mutations
 */

import React from 'react';
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from '@/services/api';
import { useToast } from '@/hooks';

export const NotificationsList: React.FC = () => {
  const toast = useToast();

  // Auto-polling for real-time updates
  const { data: notificationsData, isLoading } = useGetMyNotificationsQuery({
    page: 1,
    limit: 20,
  });

  // Unread count with polling (30 seconds)
  const { data: unreadData } = useGetUnreadCountQuery();

  // Mutations with optimistic updates
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = unreadData?.data.count || 0;

  const handleMarkAsRead = async (id: string) => {
    try {
      // Optimistic update happens in the mutation's onQueryStarted
      await markAsRead(id).unwrap();
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic removal happens automatically
      await deleteNotification(id).unwrap();
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="notifications-container">
      <div className="header">
        <h1>Notifications</h1>
        <div className="header-actions">
          <span className="unread-badge">{unreadCount} unread</span>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead}>Mark All as Read</button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-header">
                <span className={`type-badge type-${notification.type}`}>
                  {notification.type}
                </span>
                <span className="timestamp">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              
              <div className="notification-body">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
              </div>

              <div className="notification-actions">
                {!notification.isRead && (
                  <button onClick={() => handleMarkAsRead(notification.id)}>
                    Mark as Read
                  </button>
                )}
                <button onClick={() => handleDelete(notification.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
