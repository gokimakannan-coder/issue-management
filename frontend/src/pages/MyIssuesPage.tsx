import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Send, Plus, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { issueService } from '../services/issueService';
import { Issue } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { IssueStatusBadge } from '../components/issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../components/issues/IssuePriorityBadge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const MyIssuesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'assigned' | 'reported'>('assigned');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadIssues = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const params =
        activeTab === 'assigned'
          ? { assigneeId: user.id }
          : { reporterId: user.id };

      const data = await issueService.getIssues({
        ...params,
        sortBy: 'dueDate',
        limit: 50,
      });
      setIssues(data.issues);
    } catch (error) {
      console.error('Failed to load my issues:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Issues"
        description="Focused workspace of tasks assigned directly to you and issues you have filed."
      >
        <Button size="sm" onClick={() => navigate('/issues/new')} icon={<Plus className="w-4 h-4" />}>
          Report Issue
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'assigned'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Assigned to Me</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700">
            {activeTab === 'assigned' ? issues.length : ''}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reported')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'reported'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Reported by Me</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
            {activeTab === 'reported' ? issues.length : ''}
          </span>
        </button>
      </div>

      {/* Issues Table or Empty State */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : issues.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={activeTab === 'assigned' ? UserCheck : Send}
                title={
                  activeTab === 'assigned'
                    ? 'No assigned issues'
                    : 'You haven’t reported any issues'
                }
                description={
                  activeTab === 'assigned'
                    ? 'Great work! You have no pending tickets or tasks on your desk.'
                    : 'Click below to submit a bug report or feature request.'
                }
                actionLabel="Report New Issue"
                onAction={() => navigate('/issues/new')}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Key</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">View</th>
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
                        onClick={() => navigate(`/issues/${issue.issueKey}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600">
                          {issue.issueKey}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {issue.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <IssuePriorityBadge priority={issue.priority} size="sm" />
                        </td>
                        <td className="py-3.5 px-4">
                          <IssueStatusBadge status={issue.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {issue.category?.name}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {issue.dueDate ? (
                            <span
                              className={
                                isOverdue
                                  ? 'text-rose-600 font-semibold flex items-center gap-1'
                                  : 'text-slate-500'
                              }
                            >
                              {isOverdue && <AlertTriangle className="w-3.5 h-3.5 inline" />}
                              {format(new Date(issue.dueDate), 'MMM dd, yyyy')}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all inline" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
