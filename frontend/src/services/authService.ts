import api from './api';
import { User } from '../types';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', credentials);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: { name?: string; avatar?: string; currentPassword?: string; newPassword?: string }) => {
    const res = await api.put<{ message: string; user: User }>('/auth/profile', data);
    return res.data;
  },

  getDemoAccounts: async () => {
    const res = await api.get<Array<{ id: string; email: string; name: string; role: string }>>('/auth/demo-accounts');
    return res.data;
  },
};
