/**
 * Notifications API
 * Manages user notifications with real-time updates
 */

import { baseApi, API_TAGS } from './base.api';
import type {
  ApiResponse,
  PaginatedApiResponse,
  Notification,
  NotificationPreferences,
} from '@/types';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get my notifications
    getMyNotifications: builder.query<
      PaginatedApiResponse<Notification[]>,
      { page?: number; limit?: number; isRead?: boolean }
    >({
      query: ({ page = 1, limit = 20, isRead }) => ({
        url: '/notifications/my',
        params: { page, limit, isRead },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.Notification, id })),
              { type: API_TAGS.Notification, id: 'LIST' },
            ]
          : [{ type: API_TAGS.Notification, id: 'LIST' }],
      keepUnusedDataFor: 30, // Cache for 30 seconds for real-time feel
    }),

    // Get unread count
    getUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => '/notifications/unread-count',
      providesTags: [{ type: API_TAGS.Notification, id: 'UNREAD_COUNT' }],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<ApiResponse<Notification>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.Notification, id },
        { type: API_TAGS.Notification, id: 'UNREAD_COUNT' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        // Optimistic update for list
        const patchResults: { undo: () => void }[] = [];
        
        dispatch(
          notificationsApi.util.updateQueryData('getMyNotifications', { page: 1, limit: 20 }, (draft) => {
            const notification = draft.data.find((n) => n.id === id);
            if (notification) {
              notification.isRead = true;
              notification.readAt = new Date().toISOString();
            }
          })
        );

        // Optimistic update for unread count
        const countPatch = dispatch(
          notificationsApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            draft.data.count = Math.max(0, draft.data.count - 1);
          })
        );
        patchResults.push(countPatch);

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),

    // Mark all as read
    markAllAsRead: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: [
        { type: API_TAGS.Notification, id: 'LIST' },
        { type: API_TAGS.Notification, id: 'UNREAD_COUNT' },
      ],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResults: { undo: () => void }[] = [];

        // Update all notifications in cache
        dispatch(
          notificationsApi.util.updateQueryData('getMyNotifications', { page: 1, limit: 20 }, (draft) => {
            draft.data.forEach((notification) => {
              notification.isRead = true;
              notification.readAt = new Date().toISOString();
            });
          })
        );

        // Update unread count
        const countPatch = dispatch(
          notificationsApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            draft.data.count = 0;
          })
        );
        patchResults.push(countPatch);

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),

    // Delete notification
    deleteNotification: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.Notification, id },
        { type: API_TAGS.Notification, id: 'LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        // Optimistic removal
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getMyNotifications', { page: 1, limit: 20 }, (draft) => {
            const index = draft.data.findIndex((n) => n.id === id);
            if (index !== -1) {
              const wasUnread = !draft.data[index].isRead;
              draft.data.splice(index, 1);
              draft.pagination.total -= 1;

              // Update unread count if needed
              if (wasUnread) {
                dispatch(
                  notificationsApi.util.updateQueryData('getUnreadCount', undefined, (countDraft) => {
                    countDraft.data.count = Math.max(0, countDraft.data.count - 1);
                  })
                );
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Get notification preferences
    getNotificationPreferences: builder.query<ApiResponse<NotificationPreferences>, void>({
      query: () => '/notifications/preferences',
      providesTags: [{ type: API_TAGS.Notification, id: 'PREFERENCES' }],
    }),

    // Update notification preferences
    updateNotificationPreferences: builder.mutation<
      ApiResponse<NotificationPreferences>,
      Partial<NotificationPreferences>
    >({
      query: (data) => ({
        url: '/notifications/preferences',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.Notification, id: 'PREFERENCES' }],
      onQueryStarted: async (preferences, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotificationPreferences', undefined, (draft) => {
            Object.assign(draft.data, preferences);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationsApi;
