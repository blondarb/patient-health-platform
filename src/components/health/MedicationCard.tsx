"use client";

import { Card } from "@/components/ui/card";
import { DisplayRecord } from "@/lib/fhir/types";
import { StatusBadge } from "./StatusBadge";
import { Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface MedicationCardProps {
  record: DisplayRecord;
  className?: string;
}

export function MedicationCard({ record, className }: MedicationCardProps) {
  const startDate = record.effectiveDate
    ? format(parseISO(record.effectiveDate), "MMM d, yyyy")
    : "Unknown";

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-event-medication/10 shrink-0">
          <Pill className="h-5 w-5 text-event-medication" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-text-primary">{record.title}</h3>
            <StatusBadge status={record.status} />
          </div>
          {record.summary && (
            <p className="text-sm text-text-secondary mt-1">{record.summary}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            <span>Started: {startDate}</span>
            {record.facility && <span>• {record.facility}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}
