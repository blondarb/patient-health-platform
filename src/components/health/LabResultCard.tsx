"use client";

import { Card } from "@/components/ui/card";
import { DisplayRecord } from "@/lib/fhir/types";
import { StatusBadge } from "./StatusBadge";
import { ReferenceRangeBar } from "./ReferenceRangeBar";
import { SparklineChart } from "./SparklineChart";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LabResultCardProps {
  record: DisplayRecord;
  trendData?: Array<{ date: string; value: number }>;
  explanation?: string;
  className?: string;
}

export function LabResultCard({ record, trendData, explanation, className }: LabResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasRange =
    record.refRangeLow !== undefined &&
    record.refRangeLow !== null &&
    record.refRangeHigh !== undefined &&
    record.refRangeHigh !== null;
  const hasValue = record.numericValue !== undefined && record.numericValue !== null;

  return (
    <Card className={cn("p-4", className)}>
      {/* Critical banner */}
      {record.status === "critical" && (
        <div className="bg-status-critical/10 border border-status-critical/30 rounded-md px-3 py-2 mb-3" role="alert">
          <p className="text-sm font-medium text-status-critical">
            ✕ This value is outside the safe range. Contact your provider.
          </p>
        </div>
      )}

      {/* Header: name + value + badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-text-primary">{record.title}</h3>
          {record.facility && (
            <p className="text-xs text-text-muted mt-0.5">{record.facility}</p>
          )}
        </div>
        <StatusBadge status={record.status} />
      </div>

      {/* Value */}
      {hasValue && (
        <p className="text-2xl font-bold text-text-primary mt-2">
          {record.numericValue} <span className="text-base font-normal text-text-secondary">{record.unit}</span>
        </p>
      )}

      {/* Reference range bar */}
      {hasValue && hasRange && (
        <div className="mt-3">
          <ReferenceRangeBar
            value={record.numericValue!}
            unit={record.unit || ""}
            refLow={record.refRangeLow!}
            refHigh={record.refRangeHigh!}
            label={record.title}
          />
        </div>
      )}

      {/* Sparkline trend */}
      {trendData && trendData.length >= 2 && (
        <div className="mt-3">
          <p className="text-xs text-text-muted mb-1">Trend (last {trendData.length} results)</p>
          <SparklineChart
            data={trendData}
            unit={record.unit || ""}
            refLow={record.refRangeLow}
            refHigh={record.refRangeHigh}
            label={record.title}
          />
        </div>
      )}

      {/* Expandable explanation */}
      {explanation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-brand-teal hover:text-brand-teal/80 mt-3 min-h-[44px]"
          aria-expanded={expanded}
        >
          What does this test measure?
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
      {expanded && explanation && (
        <p className="text-sm text-text-secondary mt-1 pl-1">{explanation}</p>
      )}
    </Card>
  );
}
