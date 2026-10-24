import api from './api';
import { Notification } from '../types';

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications');
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch<Notification>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch<{ message: string }>('/notifications/read-all');
    return res.data;
  },

  clearNotifications: async () => {
    const res = await api.delete<{ message: string }>('/notifications/clear');
    return res.data;
  },
};
