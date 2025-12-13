import { apiSlice } from "./apiSlice.js";

const NOTIFICATION_URL = "/notifications";

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: NOTIFICATION_URL,
        method: "GET",
        params: params, // For query params like ?markAsRead=true&limit=20&page=1
      }),
      providesTags: ["Notification"],
    }),

    // Get unread notification count
    getUnreadCount: builder.query({
      query: () => ({
        url: `${NOTIFICATION_URL}/unread-count`,
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),

    // Get recent notifications (for dropdown/notification bell)
    getRecentNotifications: builder.query({
      query: (limit = 10) => ({
        url: `${NOTIFICATION_URL}/recent`,
        method: "GET",
        params: { limit },
      }),
      providesTags: ["Notification"],
    }),

    // Get notification settings
    getNotificationSettings: builder.query({
      query: () => ({
        url: `${NOTIFICATION_URL}/settings`,
        method: "GET",
      }),
      providesTags: ["NotificationSettings"],
    }),

    // Update notification settings
    updateNotificationSettings: builder.mutation({
      query: (data) => ({
        url: `${NOTIFICATION_URL}/settings`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["NotificationSettings"],
    }),

    // Mark specific notification as read
    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `${NOTIFICATION_URL}/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: `${NOTIFICATION_URL}/read-all`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Delete specific notification
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `${NOTIFICATION_URL}/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Clear all notifications
    clearAllNotifications: builder.mutation({
      query: () => ({
        url: NOTIFICATION_URL,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useGetRecentNotificationsQuery,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} = notificationApiSlice;