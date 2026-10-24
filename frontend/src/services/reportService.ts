import api from './api';
import { DashboardStats, AnalyticsReport } from '../types';

export const reportService = {
  getDashboardStats: async () => {
    const res = await api.get<DashboardStats>('/reports/dashboard');
    return res.data;
  },

  getAnalytics: async (params?: { startDate?: string; endDate?: string; teamId?: string; categoryId?: string }) => {
    const res = await api.get<AnalyticsReport>('/reports/analytics', { params });
    return res.data;
  },

  exportCsv: async (params?: { startDate?: string; endDate?: string; status?: string; priority?: string }) => {
    const res = await api.get('/reports/export/csv', {
      params,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issues-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
