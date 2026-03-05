"use client";

import { useState } from "react";
import useSWR from "swr";
import { AppShell } from "@/components/layout/AppShell";
import { TimelineCard } from "@/components/health/TimelineCard";
import { CategoryChip } from "@/components/health/CategoryChip";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { DisplayRecord, RecordCategory } from "@/lib/fhir/types";

const DEMO_USER_ID = "demo-margaret";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categories: RecordCategory[] = [
  "labs",
  "medications",
  "conditions",
  "visits",
  "allergies",
  "immunizations",
  "procedures",
];

export default function RecordsPage() {
  const [filter, setFilter] = useState<RecordCategory | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useSWR(
    `/api/records?userId=${DEMO_USER_ID}&limit=200`,
    fetcher
  );

  const records: DisplayRecord[] = (data?.records || []).map(
    (r: Record<string, unknown>) => ({
      ...r,
      effectiveDate:
        typeof r.effectiveDate === "string"
          ? r.effectiveDate
          : new Date(r.effectiveDate as string).toISOString(),
    })
  );

  const categoryCounts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const filteredRecords = records.filter((r) => {
    if (filter && r.category !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(s) ||
        r.summary?.toLowerCase().includes(s) ||
        r.facility?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-brand-navy mb-4">Records</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <Input
          placeholder="Search records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 min-h-[44px]"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) =>
          (categoryCounts[cat] || 0) > 0 ? (
            <CategoryChip
              key={cat}
              category={cat}
              count={categoryCounts[cat]}
              active={filter === cat}
              onClick={() => setFilter(filter === cat ? null : cat)}
            />
          ) : null
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted mb-3">
        {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
        {filter ? ` in ${filter}` : ""}
      </p>

      {/* Records list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-brand-teal animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center text-text-muted py-8">No matching records.</p>
      ) : (
        <div className="space-y-2">
          {filteredRecords.map((record) => (
            <TimelineCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
