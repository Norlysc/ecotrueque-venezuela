import { create } from 'zustand';
import type { Notification } from '@/types/app.types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  unreadMessageCount: number;
  pushToken: string | null;
}

interface NotificationActions {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setPushToken: (token: string | null) => void;
  setUnreadCount: (count: number) => void;
  setUnreadMessageCount: (count: number) => void;
  incrementUnreadMessageCount: () => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>((set) => ({
  notifications: [],
  unreadCount: 0,
  unreadMessageCount: 0,
  pushToken: null,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),

  setPushToken: (pushToken) => set({ pushToken }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  setUnreadMessageCount: (count) => set({ unreadMessageCount: count }),

  incrementUnreadMessageCount: () =>
    set((state) => ({ unreadMessageCount: state.unreadMessageCount + 1 })),
}));
