'use client';

import { INSPECTION_STATUSES } from '@/constants/defaults';
import { InspectionStatus } from '@/types/inspection';
import { cn } from '@/lib/cn';

interface StatusBadgeProps {
  status: InspectionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = INSPECTION_STATUSES.find((s) => s.value === status);

  if (!statusConfig) {
    return null;
  }

  return (
    <span className={cn('px-3 py-1 rounded-full text-sm font-medium', statusConfig.color)}>
      {statusConfig.label}
    </span>
  );
}
