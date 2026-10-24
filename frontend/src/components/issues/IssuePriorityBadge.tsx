import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import { Priority } from '../../types';

interface IssuePriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const IssuePriorityBadge: React.FC<IssuePriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const configs: Record<Priority, { label: string; bg: string; text: string; icon: React.ReactNode; border: string }> = {
    LOW: {
      label: 'Low',
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      icon: <ArrowDown className="w-3.5 h-3.5 text-slate-500" />,
      border: 'border-slate-200',
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: <ArrowUp className="w-3.5 h-3.5 text-blue-500" />,
      border: 'border-blue-200/60',
    },
    HIGH: {
      label: 'High',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />,
      border: 'border-orange-200/60',
    },
    CRITICAL: {
      label: 'Critical',
      bg: 'bg-rose-50',
      text: 'text-rose-700 font-semibold',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />,
      border: 'border-rose-300',
    },
  };

  const config = configs[priority] || configs.MEDIUM;
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClasses} ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};
