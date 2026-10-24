import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FolderKanban,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { reportService } from '../services/reportService';
import { AnalyticsReport } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';

export const ReportsAnalyticsPage: React.FC = () => {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await reportService.getAnalytics({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setReport(data);
    } catch (error) {
      console.error('Failed to load report analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExportCsv = async () => {
    try {
      toast.info('Exporting report CSV...');
      await reportService.exportCsv({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const priorityColors: Record<string, string> = {
    LOW: '#94a3b8',
    MEDIUM: '#3b82f6',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };

  if (isLoading || !report) {
    return (
      <div className="space-y-6 pb-16">
        <PageHeader title="Reports & Analytics" description="Loading metrics..." />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const { summary, byCategory, byPriority, byEmployee } = report;

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive audit of issue volumes, resolution speeds, team workload, and SLA compliance."
      >
        <Button size="sm" onClick={handleExportCsv} icon={<Download className="w-4 h-4" />}>
          Export Full Report (CSV)
        </Button>
      </PageHeader>

      {/* Date-Range Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Date Range:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-rose-600 hover:underline font-medium ml-1"
            >
              Clear dates
            </button>
          )}
        </div>

        {/* Quick Range Presets */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1">Presets:</span>
          <button
            onClick={() => handleQuickRange(7)}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition-colors"
          >
            Last 7d
          </button>
          <button
            onClick={() => handleQuickRange(30)}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition-colors"
          >
            Last 30d
          </button>
          <button
            onClick={() => handleQuickRange(90)}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition-colors"
          >
            Last 90d
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Reported"
          value={summary.total}
          icon={<BarChart3 className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="Issues Resolved"
          value={summary.resolved}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Open Backlog"
          value={summary.open}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Overdue Count"
          value={summary.overdue}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Avg. Resolution Time"
          value={`${summary.avgResolutionHours} hrs`}
          icon={<Clock className="w-5 h-5" />}
          color="purple"
          subtitle="From report to resolution"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Issues by Employee (Stacked Bar) */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Issues Resolved vs Pending by Engineer</CardTitle>
            <p className="text-xs text-slate-400">Team workload allocation & output</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byEmployee} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Breakdown (Donut) */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Issues by Priority</CardTitle>
            <p className="text-xs text-slate-400">Distribution by severity</p>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={byPriority}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {byPriority.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={priorityColors[entry.name] || '#3b82f6'} />
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
            <div className="flex justify-around w-full pt-2 border-t border-slate-100 text-center">
              {byPriority.map((p) => (
                <div key={p.name}>
                  <span className="text-[10px] text-slate-400 block">{p.name}</span>
                  <span className="text-xs font-bold text-slate-800">{p.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issues by Category Bar Chart */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle>Issues by Functional Category</CardTitle>
            <p className="text-xs text-slate-400">Volume across functional areas and components</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="count" name="Issues" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
