import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Paperclip,
  Trash2,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { issueService } from '../services/issueService';
import { categoryService } from '../services/categoryService';
import { reportService } from '../services/reportService';
import { Issue, IssueCategory, Priority, Status } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { IssueFilterBar } from '../components/issues/IssueFilterBar';
import { IssueStatusBadge } from '../components/issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../components/issues/IssuePriorityBadge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const AllIssuesPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state from URL query or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'ALL');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || 'ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'dueDate'>(
    (searchParams.get('sortBy') as any) || 'newest'
  );
  const [overdueOnly, setOverdueOnly] = useState(searchParams.get('overdueOnly') === 'true');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Issue | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories once
  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const loadIssues = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await issueService.getIssues({
        search,
        status: status !== 'ALL' ? status : undefined,
        priority: priority !== 'ALL' ? priority : undefined,
        categoryId: categoryId !== 'ALL' ? categoryId : undefined,
        sortBy,
        overdueOnly: overdueOnly || undefined,
        page,
        limit: 10,
        myIssuesOnly: false,
      });
      setIssues(data.issues);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, priority, categoryId, sortBy, overdueOnly, page]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPriority('ALL');
    setCategoryId('ALL');
    setSortBy('newest');
    setOverdueOnly(false);
    setPage(1);
    setSearchParams({});
  };

  const handleExportCsv = async () => {
    try {
      toast.info('Generating CSV report...');
      await reportService.exportCsv({
        status: status !== 'ALL' ? status : undefined,
        priority: priority !== 'ALL' ? priority : undefined,
      });
      toast.success('Report downloaded');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleDeleteIssue = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await issueService.deleteIssue(deleteTarget.id);
      toast.success(`Issue ${deleteTarget.issueKey} deleted`);
      setDeleteTarget(null);
      loadIssues();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete issue');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Issue Tracker"
        description="Comprehensive list of reported organizational issues, bug tickets, and SLA requests."
      >
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/issues/new')}
            icon={<Plus className="w-4 h-4" />}
          >
            Report Issue
          </Button>
        </div>
      </PageHeader>

      {/* Filter and Search Bar */}
      <IssueFilterBar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        status={status}
        onStatusChange={(val) => { setStatus(val); setPage(1); }}
        priority={priority}
        onPriorityChange={(val) => { setPriority(val); setPage(1); }}
        categoryId={categoryId}
        onCategoryChange={(val) => { setCategoryId(val); setPage(1); }}
        sortBy={sortBy}
        onSortByChange={(val) => { setSortBy(val); setPage(1); }}
        overdueOnly={overdueOnly}
        onOverdueToggle={() => { setOverdueOnly((prev) => !prev); setPage(1); }}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Issues Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={7} />
            </div>
          ) : issues.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={AlertTriangle}
                title="No issues found"
                description="No issues matched your current search filters. Try adjusting your query or reset filters."
                actionLabel="Reset Filters"
                onAction={handleResetFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Key</th>
                    <th className="py-3.5 px-4">Title & Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Assignee</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {issues.map((issue) => {
                    const isOverdue =
                      issue.dueDate &&
                      new Date(issue.dueDate) < new Date() &&
                      issue.status !== 'RESOLVED' &&
                      issue.status !== 'CLOSED';

                    return (
                      <tr
                        key={issue.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Key */}
                        <td
                          onClick={() => navigate(`/issues/${issue.issueKey}`)}
                          className="py-3 px-4 font-mono font-bold text-xs text-indigo-600 cursor-pointer hover:underline"
                        >
                          {issue.issueKey}
                        </td>

                        {/* Title & Category */}
                        <td
                          onClick={() => navigate(`/issues/${issue.issueKey}`)}
                          className="py-3 px-4 cursor-pointer max-w-sm"
                        >
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {issue.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: issue.category?.color || '#3b82f6' }}
                            />
                            <span className="text-[11px] text-slate-500">
                              {issue.category?.name}
                            </span>
                            {(issue._count?.comments ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <MessageSquare className="w-3 h-3" />
                                {issue._count?.comments}
                              </span>
                            )}
                            {(issue._count?.attachments ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Paperclip className="w-3 h-3" />
                                {issue._count?.attachments}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-4">
                          <IssuePriorityBadge priority={issue.priority} size="sm" />
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <IssueStatusBadge status={issue.status} size="sm" />
                        </td>

                        {/* Assignee */}
                        <td className="py-3 px-4 text-xs">
                          {issue.assignee ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  issue.assignee.avatar ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                    issue.assignee.name
                                  )}`
                                }
                                alt=""
                                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                              />
                              <span className="font-medium text-slate-700">{issue.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-4 text-xs">
                          {issue.dueDate ? (
                            <div
                              className={`flex items-center gap-1 font-medium ${
                                isOverdue ? 'text-rose-600' : 'text-slate-600'
                              }`}
                            >
                              {isOverdue && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />}
                              <span>{format(new Date(issue.dueDate), 'MMM dd, yyyy')}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {format(new Date(issue.createdAt), 'MMM dd')}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/issues/${issue.issueKey}/edit`)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit Issue"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => setDeleteTarget(issue)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Delete Issue"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing{' '}
                <span className="font-semibold text-slate-800">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-800">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-semibold text-slate-800">{pagination.total}</span> issues
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>
                <span className="font-medium text-slate-700 px-1">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteIssue}
        title="Delete Issue"
        message={`Are you sure you want to delete issue ${deleteTarget?.issueKey} ("${deleteTarget?.title}")? All comments, attachments, and audit history will be permanently deleted.`}
        confirmLabel="Delete Issue"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
