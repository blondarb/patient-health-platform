"use client";

import { Badge } from "@/components/ui/badge";
import { RecordStatus } from "@/lib/fhir/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  RecordStatus,
  { label: string; icon: string; className: string; ariaLabel: string }
> = {
  normal: {
    label: "Normal",
    icon: "✓",
    className: "bg-status-normal/10 text-status-normal border-status-normal/30",
    ariaLabel: "Normal result",
  },
  abnormal: {
    label: "Abnormal",
    icon: "⚠",
    className: "bg-status-abnormal/10 text-status-abnormal border-status-abnormal/30",
    ariaLabel: "Abnormal result - discuss with your provider",
  },
  critical: {
    label: "Critical",
    icon: "✕",
    className: "bg-status-critical/10 text-status-critical border-status-critical/30",
    ariaLabel: "Critical result - contact your provider promptly",
  },
  active: {
    label: "Active",
    icon: "●",
    className: "bg-brand-teal/10 text-brand-teal border-brand-teal/30",
    ariaLabel: "Active",
  },
  resolved: {
    label: "Resolved",
    icon: "○",
    className: "bg-text-secondary/10 text-text-secondary border-text-secondary/30",
    ariaLabel: "Resolved",
  },
};

interface StatusBadgeProps {
  status: RecordStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
      aria-label={config.ariaLabel}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
