"use client";

import { Badge } from "@/components/ui/badge";
import { RecordCategory } from "@/lib/fhir/types";
import { categoryLabels, categoryColors } from "@/lib/fhir/categories";
import { cn } from "@/lib/utils";

interface CategoryChipProps {
  category: RecordCategory;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryChip({ category, count, active, onClick, className }: CategoryChipProps) {
  const label = categoryLabels[category];
  const color = categoryColors[category];

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        "min-h-[44px] min-w-[44px]", // Touch target
        "border",
        active
          ? "text-white"
          : "bg-white text-text-primary border-surface-border hover:bg-surface-bg",
        className
      )}
      style={active ? { backgroundColor: color, borderColor: color } : undefined}
      aria-pressed={active}
      aria-label={`Filter by ${label}${count !== undefined ? `, ${count} items` : ""}`}
    >
      {label}
      {count !== undefined && (
        <Badge
          variant="secondary"
          className={cn(
            "h-5 min-w-5 rounded-full px-1.5 text-xs",
            active ? "bg-white/20 text-white" : "bg-surface-bg text-text-secondary"
          )}
        >
          {count}
        </Badge>
      )}
    </button>
  );
}
