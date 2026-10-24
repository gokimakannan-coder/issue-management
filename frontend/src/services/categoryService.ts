import api from './api';
import { IssueCategory } from '../types';

export const categoryService = {
  getCategories: async () => {
    const res = await api.get<IssueCategory[]>('/categories');
    return res.data;
  },

  createCategory: async (data: { name: string; description?: string; color: string }) => {
    const res = await api.post<IssueCategory>('/categories', data);
    return res.data;
  },

  updateCategory: async (id: string, data: { name?: string; description?: string; color?: string }) => {
    const res = await api.put<IssueCategory>(`/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/categories/${id}`);
    return res.data;
  },
};
