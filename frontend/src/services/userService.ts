import api from './api';
import { User, Role } from '../types';

export const userService = {
  getUsers: async (params?: { role?: string; teamId?: string; search?: string }) => {
    const res = await api.get<User[]>('/users', { params });
    return res.data;
  },

  getUser: async (id: string) => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    password?: string;
    role: Role;
    teamId?: string | null;
  }) => {
    const res = await api.post<User>('/users', data);
    return res.data;
  },

  updateUser: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: Role;
      teamId?: string | null;
      password?: string;
    }
  ) => {
    const res = await api.put<User>(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/users/${id}`);
    return res.data;
  },
};
