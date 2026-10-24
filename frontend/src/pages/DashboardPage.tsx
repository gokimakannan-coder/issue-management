import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { reportService } from '../services/reportService';
import { DashboardStats } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { IssueStatusBadge } from '../components/issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../components/issues/IssuePriorityBadge';
import { Button } from '../components/ui/Button';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await reportService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Loading real-time operational metrics..." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const { summary, charts, recentIssues } = stats;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Header */}
      <PageHeader
        title={`Welcome back, ${user?.name}`}
        description={`Here is an overview of active issues, team performance, and resolution SLA metrics.`}
      >
        <Button size="sm" onClick={() => navigate('/issues/new')}>
          + Report New Issue
        </Button>
      </PageHeader>

      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Issues"
          value={summary.total}
          icon={<Layers className="w-5 h-5" />}
          color="indigo"
          onClick={() => navigate('/issues')}
        />
        <StatCard
          title="Open"
          value={summary.open}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
          onClick={() => navigate('/issues?status=OPEN')}
        />
        <StatCard
          title="In Progress"
          value={summary.inProgress}
          icon={<TrendingUp className="w-5 h-5" />}
          color="amber"
          onClick={() => navigate('/issues?status=IN_PROGRESS')}
        />
        <StatCard
          title="Resolved"
          value={summary.resolved}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
          onClick={() => navigate('/issues?status=RESOLVED')}
        />
        <StatCard
          title="Critical"
          value={summary.critical}
          icon={<Flame className="w-5 h-5" />}
          color="rose"
          badge={
            summary.critical > 0 ? (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Urgent
              </span>
            ) : undefined
          }
          onClick={() => navigate('/issues?priority=CRITICAL')}
        />
        <StatCard
          title="Overdue"
          value={summary.overdue}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="purple"
          badge={
            summary.overdue > 0 ? (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Action Req.
              </span>
            ) : undefined
          }
          onClick={() => navigate('/issues?overdueOnly=true')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Trend (Area Chart) */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Issues Created vs Resolved Over Time</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Velocity trends over the past 14 days</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.timeTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="created" name="Created" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issues by Status (Donut Chart) */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
            <p className="text-xs text-slate-400">Current pipeline distribution</p>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={charts.byStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {charts.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-100 text-center">
              {charts.byStatus.slice(0, 3).map((item) => (
                <div key={item.name}>
                  <span className="text-[10px] text-slate-400 block truncate">{item.name}</span>
                  <span className="text-xs font-bold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issues by Priority (Bar Chart) */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Issues by Priority</CardTitle>
            <p className="text-xs text-slate-400">Severity breakdown</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.byPriority} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" name="Issues" radius={[4, 4, 0, 0]}>
                  {charts.byPriority.map((entry, index) => (
                    <Cell key={`prio-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issues by Category */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <p className="text-xs text-slate-400">Volume across functional areas</p>
          </CardHeader>
          <CardContent className="h-64 overflow-y-auto space-y-3">
            {charts.byCategory.map((cat) => {
              const total = summary.total || 1;
              const percent = Math.round((cat.count / total) * 100);

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <span className="text-slate-500 font-semibold">
                      {cat.count} <span className="text-slate-400">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: cat.color || '#6366f1' }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Team Workload & Performance */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Team Workload & Output</CardTitle>
            <p className="text-xs text-slate-400">Active vs resolved issues per engineer</p>
          </CardHeader>
          <CardContent className="h-64 overflow-y-auto space-y-3">
            {charts.teamWorkload.map((member) => (
              <div key={member.name} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">{member.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-700 font-medium">{member.active} active</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">{member.resolved} resolved</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full flex overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: member.total > 0 ? `${(member.resolved / member.total) * 100}%` : '0%' }}
                    title={`${member.resolved} resolved`}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{ width: member.total > 0 ? `${(member.active / member.total) * 100}%` : '0%' }}
                    title={`${member.active} active`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Issues</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Most recently created and updated tickets</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/issues')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            View All Issues
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Issue Key</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentIssues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No issues created yet.
                    </td>
                  </tr>
                ) : (
                  recentIssues.map((issue) => {
                    const isOverdue =
                      issue.dueDate &&
                      new Date(issue.dueDate) < new Date() &&
                      issue.status !== 'RESOLVED' &&
                      issue.status !== 'CLOSED';

                    return (
                      <tr
                        key={issue.id}
                        onClick={() => navigate(`/issues/${issue.issueKey}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-xs text-indigo-600">
                          {issue.issueKey}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate">
                          {issue.title}
                        </td>
                        <td className="py-3 px-4">
                          <IssuePriorityBadge priority={issue.priority} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          <IssueStatusBadge status={issue.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
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
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span>{issue.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {format(new Date(issue.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-xs">
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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
