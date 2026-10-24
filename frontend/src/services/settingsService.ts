import api from './api';
import { SystemSettings } from '../types';

export const settingsService = {
  getSettings: async () => {
    const res = await api.get<SystemSettings>('/settings');
    return res.data;
  },

  updateSettings: async (settings: Partial<SystemSettings>) => {
    const res = await api.put<{ message: string }>('/settings', settings);
    return res.data;
  },
};
