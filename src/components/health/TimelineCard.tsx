"use client";

import { Card } from "@/components/ui/card";
import { DisplayRecord, RecordCategory } from "@/lib/fhir/types";
import { categoryColors } from "@/lib/fhir/categories";
import { StatusBadge } from "./StatusBadge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import Link from "next/link";

function getDetailRoute(record: DisplayRecord): string {
  switch (record.category) {
    case "labs":
      return `/records/labs/${record.id}`;
    case "medications":
      return `/records/medications/${record.id}`;
    case "conditions":
      return `/records/conditions/${record.id}`;
    default:
      return `/records`;
  }
}

interface TimelineCardProps {
  record: DisplayRecord;
  className?: string;
}

export function TimelineCard({ record, className }: TimelineCardProps) {
  const color = categoryColors[record.category as RecordCategory];
  const date = record.effectiveDate
    ? format(parseISO(record.effectiveDate), "MMM d, yyyy")
    : "Unknown date";

  const valueDisplay =
    record.numericValue !== undefined && record.numericValue !== null
      ? `${record.numericValue} ${record.unit || ""}`
      : null;

  return (
    <Link href={getDetailRoute(record)} className="block">
      <Card
        className={cn(
          "p-4 hover:bg-surface-bg transition-colors cursor-pointer",
          className
        )}
        aria-label={`${record.title}, ${date}${valueDisplay ? `, value ${valueDisplay}` : ""}`}
      >
        <div className="flex items-center gap-3">
          {/* Date + category dot */}
          <div className="flex flex-col items-center shrink-0 w-16">
            <div
              className="w-3 h-3 rounded-full mb-1"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-xs text-text-secondary text-center">{date}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-text-primary truncate">
                {record.title}
              </span>
              <StatusBadge status={record.status} />
            </div>
            {valueDisplay && (
              <p className="text-lg font-bold text-text-primary mt-0.5">{valueDisplay}</p>
            )}
            {record.summary && (
              <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">{record.summary}</p>
            )}
            {record.facility && (
              <p className="text-xs text-text-muted mt-0.5">{record.facility}</p>
            )}
          </div>

          {/* Chevron */}
          <ChevronRight className="h-5 w-5 text-text-muted shrink-0" aria-hidden="true" />
        </div>
      </Card>
    </Link>
  );
}
