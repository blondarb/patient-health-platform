"use client";

import { RecordCategory } from "@/lib/fhir/types";
import { categoryLabels } from "@/lib/fhir/categories";
import { cn } from "@/lib/utils";

const allCategories: RecordCategory[] = [
  "labs",
  "medications",
  "conditions",
  "visits",
  "allergies",
  "immunizations",
  "procedures",
];

interface SharingPermissionGridProps {
  permissions: Record<string, boolean>;
  onChange: (permissions: Record<string, boolean>) => void;
  disabled?: boolean;
  className?: string;
}

export function SharingPermissionGrid({
  permissions,
  onChange,
  disabled,
  className,
}: SharingPermissionGridProps) {
  const toggle = (category: string) => {
    if (disabled) return;
    onChange({ ...permissions, [category]: !permissions[category] });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-text-primary">Data categories to share:</p>
      <div className="grid grid-cols-2 gap-2">
        {allCategories.map((cat) => (
          <label
            key={cat}
            className={cn(
              "flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors min-h-[44px]",
              permissions[cat]
                ? "bg-brand-teal/5 border-brand-teal"
                : "bg-white border-surface-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="checkbox"
              checked={permissions[cat] || false}
              onChange={() => toggle(cat)}
              disabled={disabled}
              className="h-4 w-4 rounded border-surface-border text-brand-teal focus:ring-brand-teal"
            />
            <span className="text-sm text-text-primary">{categoryLabels[cat]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
