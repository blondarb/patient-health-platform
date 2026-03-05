"use client";

import { Card } from "@/components/ui/card";
import { AlertSeverity, HealthAlert } from "@/lib/alerts/thresholds";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

const severityConfig: Record<
  AlertSeverity,
  { icon: typeof AlertTriangle; bgClass: string; borderClass: string; textClass: string }
> = {
  critical: {
    icon: AlertTriangle,
    bgClass: "bg-status-critical/5",
    borderClass: "border-l-4 border-l-status-critical",
    textClass: "text-status-critical",
  },
  attention: {
    icon: AlertCircle,
    bgClass: "bg-status-abnormal/5",
    borderClass: "border-l-4 border-l-status-abnormal",
    textClass: "text-status-abnormal",
  },
  info: {
    icon: Info,
    bgClass: "bg-event-lab/5",
    borderClass: "border-l-4 border-l-event-lab",
    textClass: "text-event-lab",
  },
};

interface AlertCardProps {
  alert: HealthAlert;
  className?: string;
}

export function AlertCard({ alert, className }: AlertCardProps) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "p-4",
        config.bgClass,
        config.borderClass,
        className
      )}
      role="alert"
      aria-label={`${alert.severity} alert: ${alert.title}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.textClass)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm", config.textClass)}>
            {alert.title}: {alert.value} {alert.unit}
          </p>
          <p className="text-sm text-text-secondary mt-1">{alert.message}</p>
          <p className="text-xs text-text-muted mt-1">{alert.actionText}</p>
        </div>
      </div>
    </Card>
  );
}
