import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      {...props}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 bg-slate-50/80 rounded-lg animate-pulse border border-slate-100" />
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="p-5 bg-white rounded-xl border border-slate-200/70 space-y-4 animate-pulse">
    <div className="h-4 w-1/3 bg-slate-200 rounded" />
    <div className="h-8 w-1/2 bg-slate-200 rounded" />
    <div className="h-3 w-3/4 bg-slate-100 rounded" />
  </div>
);
