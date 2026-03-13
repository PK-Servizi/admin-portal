/**
 * Notifications Admin Page
 * Send, broadcast, and manage notifications
 */

import React, { useState } from 'react';
import {
  useGetMyNotificationsQuery,
  useSendNotificationMutation,
  useBroadcastNotificationMutation,
  useSendToRoleMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
} from '@/services/api/notifications.api';
import { useGetAllUsersQuery } from '@/services/api/users-admin.api';
import { useGetAllRolesQuery } from '@/services/api/roles.api';
import { cn } from '@/lib/utils';
import {
  Bell,
  Send,
  Users,
  Shield,
  User,
  X,
  Loader2,
  Search,
  RefreshCw,
  Trash2,
  CheckCheck,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';

type SendMode = 'user' | 'broadcast' | 'role';

interface SendFormData {
  userId: string;
  roleId: string;
  title: string;
  message: string;
  type: string;
}

const initialSendForm: SendFormData = {
  userId: '',
  roleId: '',
  title: '',
  message: '',
  type: 'info',
};

const notificationTypes = [
  { value: 'info', label: 'Info', icon: Info, color: 'blue' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'green' },
  { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'yellow' },
  { value: 'error', label: 'Error', icon: AlertCircle, color: 'red' },
];

export const NotificationsAdmin: React.FC = () => {
  const [sendMode, setSendMode] = useState<SendMode>('broadcast');
  const [showSendModal, setShowSendModal] = useState(false);
  const [formData, setFormData] = useState<SendFormData>(initialSendForm);
  const [userSearch, setUserSearch] = useState('');

  // API hooks
  const { data: notificationsData, isLoading, isFetching, refetch } = useGetMyNotificationsQuery({
    page: 1,
    limit: 50,
  });
  const { data: usersData } = useGetAllUsersQuery({ take: 100 });
  const { data: rolesData } = useGetAllRolesQuery();

  const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();
  const [broadcastNotification, { isLoading: isBroadcasting }] = useBroadcastNotificationMutation();
  const [sendToRole, { isLoading: isSendingToRole }] = useSendToRoleMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.data || [];
  const users = usersData?.data || [];
  const roles = rolesData?.data || [];
  const isSendingAny = isSending || isBroadcasting || isSendingToRole;

  const filteredUsers = users.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleOpenSend = (mode: SendMode) => {
    setSendMode(mode);
    setFormData(initialSendForm);
    setShowSendModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (sendMode === 'user') {
        await sendNotification({
          userId: formData.userId,
          title: formData.title,
          message: formData.message,
          type: formData.type,
        }).unwrap();
      } else if (sendMode === 'broadcast') {
        await broadcastNotification({
          title: formData.title,
          message: formData.message,
          type: formData.type,
        }).unwrap();
      } else if (sendMode === 'role') {
        await sendToRole({
          roleId: formData.roleId,
          title: formData.title,
          message: formData.message,
          type: formData.type,
        }).unwrap();
      }
      setShowSendModal(false);
      setFormData(initialSendForm);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const config: Record<string, { className: string }> = {
      info: { className: 'text-blue-500' },
      success: { className: 'text-green-500' },
      warning: { className: 'text-yellow-500' },
      error: { className: 'text-red-500' },
    };
    return config[type] || config.info;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Send and manage notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={cn('h-5 w-5', isFetching && 'animate-spin')} />
          </button>
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Send Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => handleOpenSend('user')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Send to User</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Notify a specific user</p>
          </div>
        </button>
        <button
          onClick={() => handleOpenSend('broadcast')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Broadcast</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Notify all users</p>
          </div>
        </button>
        <button
          onClick={() => handleOpenSend('role')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Send to Role</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Notify by role</p>
          </div>
        </button>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Notifications ({notifications.length})
          </h2>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Send your first notification using the options above
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start gap-4 px-6 py-4 transition-colors',
                  !notification.isRead && 'bg-blue-50/50 dark:bg-blue-500/5'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    getTypeIcon(notification.type || 'info').className
                  )}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowSendModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {sendMode === 'user' && 'Send to User'}
                {sendMode === 'broadcast' && 'Broadcast to All'}
                {sendMode === 'role' && 'Send to Role'}
              </h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {sendMode === 'user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Select User <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users..."
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, userId: user.id }))}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                          formData.userId === user.id
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                        )}
                      >
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        {user.firstName} {user.lastName}
                        <span className="text-gray-400 text-xs ml-auto">{user.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sendMode === 'role' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Select Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, roleId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Type
                </label>
                <div className="flex gap-2">
                  {notificationTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                        formData.type === type.value
                          ? `bg-${type.color}-50 border-${type.color}-300 text-${type.color}-700 dark:bg-${type.color}-500/10 dark:border-${type.color}-500 dark:text-${type.color}-400`
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <type.icon className="h-3.5 w-3.5" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Notification title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Notification message..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSendingAny ||
                    !formData.title ||
                    !formData.message ||
                    (sendMode === 'user' && !formData.userId) ||
                    (sendMode === 'role' && !formData.roleId)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSendingAny ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsAdmin;
