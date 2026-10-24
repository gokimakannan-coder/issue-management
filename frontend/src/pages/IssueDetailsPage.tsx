import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  UserCheck,
  User,
  Shield,
  Edit,
  Trash2,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { issueService } from '../services/issueService';
import { userService } from '../services/userService';
import { Issue, Status, User as UserType } from '../types';
import { IssueStatusBadge } from '../components/issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../components/issues/IssuePriorityBadge';
import { IssueComments } from '../components/issues/IssueComments';
import { IssueAttachments } from '../components/issues/IssueAttachments';
import { IssueActivityTimeline } from '../components/issues/IssueActivityTimeline';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const IssueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal / control
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<Status | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadIssue = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await issueService.getIssue(id);
      setIssue(data);
    } catch (error) {
      console.error('Failed to load issue:', error);
      toast.error('Issue not found');
      navigate('/issues');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadIssue();
    userService.getUsers().then(setUsers).catch(console.error);
  }, [loadIssue]);

  const handleStatusChange = async (newStatus: Status) => {
    if (!issue) return;
    try {
      setIsUpdatingStatus(true);
      await issueService.updateStatus(issue.id, newStatus, statusComment || undefined);
      toast.success(`Status updated to ${newStatus}`);
      setStatusComment('');
      setSelectedNewStatus(null);
      loadIssue();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    if (!issue) return;
    try {
      setIsReassigning(true);
      await issueService.assignIssue(issue.id, assigneeId || null);
      toast.success('Assignee updated');
      loadIssue();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update assignee');
    } finally {
      setIsReassigning(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!issue) return;
    await issueService.addComment(issue.id, content);
    loadIssue();
  };

  const handleDeleteComment = async (commentId: string) => {
    await issueService.deleteComment(commentId);
    loadIssue();
  };

  const handleUploadAttachment = async (file: File) => {
    if (!issue) return;
    await issueService.uploadAttachment(issue.id, file);
    loadIssue();
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    await issueService.deleteAttachment(attachmentId);
    loadIssue();
  };

  const handleDeleteIssue = async () => {
    if (!issue) return;
    try {
      setIsDeleting(true);
      await issueService.deleteIssue(issue.id);
      toast.success('Issue deleted');
      navigate('/issues');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete issue');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !issue) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const isOverdue =
    issue.dueDate &&
    new Date(issue.dueDate) < new Date() &&
    issue.status !== 'RESOLVED' &&
    issue.status !== 'CLOSED';

  // Permission checks
  const canEditDetails = isAdmin || isManager || issue.reporterId === user?.id;
  const canAssign = isAdmin || isManager;
  const canDelete = isAdmin;

  // Available status transitions
  const statusOptions: Status[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header / Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/issues')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Issues
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {issue.issueKey}
            </span>
            <IssuePriorityBadge priority={issue.priority} size="sm" />
            <IssueStatusBadge status={issue.status} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEditDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/issues/${issue.issueKey}/edit`)}
              icon={<Edit className="w-4 h-4" />}
            >
              Edit Details
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column (Details, Comments, Attachments) & Right Column (Meta & Workflow) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Issue Overview Card */}
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: issue.category?.color || '#3b82f6' }}
                />
                <span className="font-semibold text-slate-700">{issue.category?.name}</span>
                {issue.team && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <FolderKanban className="w-3.5 h-3.5" />
                      {issue.team.name}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {issue.title}
              </h1>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </div>

              {/* Status Workflow Action Bar */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Update Issue Status
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {statusOptions.map((st) => (
                    <button
                      key={st}
                      disabled={isUpdatingStatus || issue.status === st}
                      onClick={() => handleStatusChange(st)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                        issue.status === st
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs cursor-default'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card>
            <CardContent className="p-6">
              <IssueAttachments
                attachments={issue.attachments || []}
                onUploadAttachment={handleUploadAttachment}
                onDeleteAttachment={handleDeleteAttachment}
              />
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comments & Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <IssueComments
                comments={issue.comments || []}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Meta Information & Activity Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              {/* Assignee Control */}
              <div>
                <span className="block text-xs font-medium text-slate-400 mb-1.5">Assignee</span>
                {canAssign ? (
                  <select
                    value={issue.assigneeId || ''}
                    disabled={isReassigning}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-slate-800">
                    <img
                      src={
                        issue.assignee?.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          issue.assignee?.name || 'User'
                        )}`
                      }
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <span className="font-medium">
                      {issue.assignee ? issue.assignee.name : 'Unassigned'}
                    </span>
                  </div>
                )}
              </div>

              {/* Reporter */}
              <div>
                <span className="block text-xs font-medium text-slate-400 mb-1.5">Reporter</span>
                <div className="flex items-center gap-2 text-slate-800">
                  <img
                    src={
                      issue.reporter?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        issue.reporter?.name || 'User'
                      )}`
                    }
                    alt=""
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-medium block leading-tight">{issue.reporter?.name}</span>
                    <span className="text-[11px] text-slate-400">{issue.reporter?.email}</span>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Created
                </span>
                <span className="text-xs font-medium text-slate-700">
                  {format(new Date(issue.createdAt), 'PPP')}
                </span>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Due Date
                </span>
                <span
                  className={`text-xs font-medium ${
                    isOverdue ? 'text-rose-600 font-bold flex items-center gap-1' : 'text-slate-700'
                  }`}
                >
                  {isOverdue && <AlertTriangle className="w-3.5 h-3.5" />}
                  {issue.dueDate ? format(new Date(issue.dueDate), 'PPP') : 'None'}
                </span>
              </div>

              {/* Resolution Date (if resolved) */}
              {issue.resolutionDate && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Resolved
                  </span>
                  <span className="text-xs font-medium text-emerald-700">
                    {format(new Date(issue.resolutionDate), 'PPP')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IssueActivityTimeline activityLogs={issue.activityLogs || []} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteIssue}
        title="Delete Issue"
        message={`Are you sure you want to delete ${issue.issueKey}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
