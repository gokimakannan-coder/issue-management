import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, UserCheck, MessageSquare, Tag, FileUp, CheckCircle, RefreshCw } from 'lucide-react';
import { ActivityLog } from '../../types';

interface IssueActivityTimelineProps {
  activityLogs: ActivityLog[];
}

export const IssueActivityTimeline: React.FC<IssueActivityTimelineProps> = ({ activityLogs }) => {
  if (!activityLogs || activityLogs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No recorded activity yet.
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'STATUS_CHANGED':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'ASSIGNED':
        return <UserCheck className="w-4 h-4 text-indigo-500" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'ATTACHMENT_ADDED':
      case 'ATTACHMENT_REMOVED':
        return <FileUp className="w-4 h-4 text-purple-500" />;
      default:
        return <Tag className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {activityLogs.map((log) => (
        <div key={log.id} className="relative group">
          {/* Action icon bullet */}
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
            {getActionIcon(log.action)}
          </div>

          <div className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {log.user?.name || 'System User'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1" title={format(new Date(log.createdAt), 'PPpp')}>
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="mt-1 text-slate-600 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100/80">
              {log.details}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
