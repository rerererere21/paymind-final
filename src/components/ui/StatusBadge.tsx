import React from 'react';

type StatusType = 'active' | 'paused' | 'cancelled' | 'trial';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, { label: string; className: string; dot: string }> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  paused: {
    label: 'Paused',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-600',
    dot: 'bg-red-500',
  },
  trial: {
    label: 'Trial',
    className: 'bg-purple-50 text-purple-700',
    dot: 'bg-purple-500',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-600 tracking-wide
        ${config.className}
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}