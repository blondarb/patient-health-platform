"use client";

import { cn } from "@/lib/utils";

interface ReferenceRangeBarProps {
  value: number;
  unit: string;
  refLow: number;
  refHigh: number;
  label: string;
  className?: string;
}

export function ReferenceRangeBar({
  value,
  unit,
  refLow,
  refHigh,
  label,
  className,
}: ReferenceRangeBarProps) {
  const range = refHigh - refLow;
  const padding = range * 0.5; // Show 50% beyond range on each side
  const displayMin = refLow - padding;
  const displayMax = refHigh + padding;
  const displayRange = displayMax - displayMin;

  // Position calculations as percentages
  const normalStartPct = ((refLow - displayMin) / displayRange) * 100;
  const normalWidthPct = (range / displayRange) * 100;
  const markerPct = Math.max(0, Math.min(100, ((value - displayMin) / displayRange) * 100));

  const isNormal = value >= refLow && value <= refHigh;
  const isCritical =
    value < refLow - range * 0.3 || value > refHigh + range * 0.3;
  const status = isNormal ? "normal" : isCritical ? "critical" : "abnormal";

  const statusLabel = isNormal ? "Normal" : isCritical ? "Critical" : "Abnormal";
  const statusColor =
    status === "normal"
      ? "bg-status-normal"
      : status === "critical"
      ? "bg-status-critical"
      : "bg-status-abnormal";
  const statusIcon = status === "normal" ? "✓" : status === "critical" ? "✕" : "⚠";

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={`${label} ${value} ${unit}, ${
        isNormal
          ? "within normal range"
          : `${status}, ${value < refLow ? "below" : "above"} normal range`
      } of ${refLow} to ${refHigh} ${unit}`}
    >
      {/* Bar */}
      <div className="relative h-6 bg-surface-bg rounded-full overflow-hidden border border-surface-border">
        {/* Low zone - hatched pattern for color-blind */}
        <div
          className="absolute inset-y-0 bg-status-critical/15"
          style={{ left: 0, width: `${normalStartPct}%` }}
        >
          <div className="w-full h-full opacity-30" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)",
            color: "#E74C3C"
          }} />
        </div>

        {/* Normal zone - diagonal hatch pattern */}
        <div
          className="absolute inset-y-0 bg-status-normal/20"
          style={{
            left: `${normalStartPct}%`,
            width: `${normalWidthPct}%`,
          }}
        >
          <div className="w-full h-full opacity-20" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 4px)",
            color: "#27AE60"
          }} />
        </div>

        {/* High zone - hatched */}
        <div
          className="absolute inset-y-0 bg-status-critical/15"
          style={{
            left: `${normalStartPct + normalWidthPct}%`,
            right: 0,
          }}
        >
          <div className="w-full h-full opacity-30" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)",
            color: "#E74C3C"
          }} />
        </div>

        {/* Marker triangle */}
        <div
          className="absolute top-0 bottom-0 flex items-center"
          style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}
        >
          <div
            className={cn("w-4 h-4 rounded-full border-2 border-white shadow-md", statusColor)}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1 text-xs text-text-muted">
        <span>Low</span>
        <span>Normal Range ({refLow}–{refHigh})</span>
        <span>High</span>
      </div>

      {/* Value label */}
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className={cn("text-xs font-medium", {
          "text-status-normal": status === "normal",
          "text-status-abnormal": status === "abnormal",
          "text-status-critical": status === "critical",
        })}>
          {statusIcon} {statusLabel}: {value} {unit}
        </span>
      </div>
    </div>
  );
}
