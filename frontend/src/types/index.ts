export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Status = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  teamId?: string | null;
  team?: {
    id: string;
    name: string;
  } | null;
  assignedCount?: number;
  reportedCount?: number;
  createdAt: string;
  _count?: {
    assignedIssues?: number;
    reportedIssues?: number;
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  managerId?: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string | null;
  }>;
  _count?: {
    members: number;
    issues: number;
  };
  createdAt: string;
}

export interface IssueCategory {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  _count?: {
    issues: number;
  };
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  issueId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: Role;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  issueId: string;
  uploaderId: string;
  uploader: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  issueId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  createdAt: string;
}

export interface Issue {
  id: string;
  issueKey: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  categoryId: string;
  category: IssueCategory;
  reporterId: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: Role;
  };
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: Role;
  } | null;
  teamId?: string | null;
  team?: {
    id: string;
    name: string;
  } | null;
  dueDate?: string | null;
  resolutionDate?: string | null;
  comments?: Comment[];
  attachments?: Attachment[];
  activityLogs?: ActivityLog[];
  _count?: {
    comments: number;
    attachments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'STATUS_CHANGE' | 'COMMENT' | 'OVERDUE' | 'SYSTEM';
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  summary: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    critical: number;
    overdue: number;
  };
  charts: {
    byStatus: Array<{ name: string; value: number; color: string }>;
    byPriority: Array<{ name: string; value: number; color: string }>;
    byCategory: Array<{ name: string; count: number; color: string }>;
    timeTrends: Array<{ date: string; fullDate: string; created: number; resolved: number }>;
    teamWorkload: Array<{ name: string; active: number; resolved: number; total: number }>;
  };
  recentIssues: Array<{
    id: string;
    issueKey: string;
    title: string;
    priority: Priority;
    status: Status;
    dueDate?: string | null;
    createdAt: string;
    category?: { name: string; color: string };
    assignee?: { name: string; avatar?: string | null } | null;
  }>;
}

export interface AnalyticsReport {
  summary: {
    total: number;
    resolved: number;
    open: number;
    overdue: number;
    avgResolutionHours: string;
  };
  byCategory: Array<{ name: string; count: number }>;
  byPriority: Array<{ name: string; count: number }>;
  byEmployee: Array<{ name: string; total: number; resolved: number; pending: number }>;
}

export interface SystemSettings {
  appName: string;
  companyName: string;
  issueKeyPrefix: string;
  allowPublicRegistration: string;
  defaultDueDateDays: string;
  slaCriticalHours: string;
  slaHighHours: string;
  slaMediumHours: string;
  slaLowHours: string;
  emailNotifications: string;
  [key: string]: string;
}
