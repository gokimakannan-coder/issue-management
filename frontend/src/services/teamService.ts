import api from './api';
import { Team } from '../types';

export const teamService = {
  getTeams: async () => {
    const res = await api.get<Team[]>('/teams');
    return res.data;
  },

  getTeam: async (id: string) => {
    const res = await api.get<Team>(`/teams/${id}`);
    return res.data;
  },

  createTeam: async (data: { name: string; description?: string; managerId?: string | null }) => {
    const res = await api.post<Team>('/teams', data);
    return res.data;
  },

  updateTeam: async (id: string, data: { name?: string; description?: string; managerId?: string | null }) => {
    const res = await api.put<Team>(`/teams/${id}`, data);
    return res.data;
  },

  deleteTeam: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/teams/${id}`);
    return res.data;
  },
};
