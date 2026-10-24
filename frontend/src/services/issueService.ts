import api from './api';
import { Issue, Priority, Status, Comment, Attachment } from '../types';

export interface IssueFilterParams {
  search?: string;
  status?: string;
  priority?: string;
  categoryId?: string;
  assigneeId?: string;
  reporterId?: string;
  teamId?: string;
  overdueOnly?: boolean;
  myIssuesOnly?: boolean;
  sortBy?: 'newest' | 'oldest' | 'priority' | 'dueDate';
  page?: number;
  limit?: number;
}

export interface IssueListResponse {
  issues: Issue[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const issueService = {
  getIssues: async (params?: IssueFilterParams) => {
    const res = await api.get<IssueListResponse>('/issues', { params });
    return res.data;
  },

  getIssue: async (idOrKey: string) => {
    const res = await api.get<Issue>(`/issues/${idOrKey}`);
    return res.data;
  },

  createIssue: async (data: {
    title: string;
    description: string;
    categoryId: string;
    priority: Priority;
    assigneeId?: string | null;
    teamId?: string | null;
    dueDate?: string | null;
  }) => {
    const res = await api.post<Issue>('/issues', data);
    return res.data;
  },

  updateIssue: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      categoryId?: string;
      priority?: Priority;
      dueDate?: string | null;
    }
  ) => {
    const res = await api.put<Issue>(`/issues/${id}`, data);
    return res.data;
  },

  assignIssue: async (id: string, assigneeId: string | null) => {
    const res = await api.patch<Issue>(`/issues/${id}/assign`, { assigneeId });
    return res.data;
  },

  updateStatus: async (id: string, status: Status, comment?: string) => {
    const res = await api.patch<Issue>(`/issues/${id}/status`, { status, comment });
    return res.data;
  },

  deleteIssue: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/issues/${id}`);
    return res.data;
  },

  addComment: async (issueId: string, content: string) => {
    const res = await api.post<Comment>(`/comments/issue/${issueId}`, { content });
    return res.data;
  },

  deleteComment: async (commentId: string) => {
    const res = await api.delete<{ message: string }>(`/comments/${commentId}`);
    return res.data;
  },

  uploadAttachment: async (issueId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<Attachment>(`/attachments/issue/${issueId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteAttachment: async (attachmentId: string) => {
    const res = await api.delete<{ message: string }>(`/attachments/${attachmentId}`);
    return res.data;
  },
};
