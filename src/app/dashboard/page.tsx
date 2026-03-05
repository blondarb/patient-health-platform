"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { AppShell } from "@/components/layout/AppShell";
import { AlertCard } from "@/components/health/AlertCard";
import { TimelineCard } from "@/components/health/TimelineCard";
import { CategoryChip } from "@/components/health/CategoryChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  RefreshCw,
  Search,
  Share2,
  Link2,
  FileDown,
  Loader2,
} from "lucide-react";
import { DisplayRecord, RecordCategory, RecordStatus } from "@/lib/fhir/types";
import { evaluateAlerts, HealthAlert } from "@/lib/alerts/thresholds";
import { useRouter } from "next/navigation";

const DEMO_USER_ID = "demo-margaret";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const suggestedQuestions = [
  "Why is my creatinine going up?",
  "What does my HbA1c trend mean?",
  "Are any of my medications interacting?",
];

export default function DashboardPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<RecordCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const { data, isLoading, mutate } = useSWR(
    `/api/records?userId=${DEMO_USER_ID}&limit=100`,
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

  const alerts = evaluateAlerts(records);

  const filteredRecords = filter
    ? records.filter((r) => r.category === filter)
    : records;

  // Category counts
  const categoryCounts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await mutate();
    setRefreshing(false);
  };

  const handleAskAI = (question?: string) => {
    const q = question || aiQuery;
    if (q.trim()) {
      router.push(`/ai?q=${encodeURIComponent(q)}`);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppShell>
      {/* Greeting + Refresh */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            {greeting()}, Margaret
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Last updated: just now •{" "}
            <button
              onClick={handleRefresh}
              className="text-brand-teal hover:underline inline-flex items-center gap-1"
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Quick AI */}
      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Ask about your health..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
              className="pl-10 min-h-[44px]"
            />
          </div>
          <Button
            onClick={() => handleAskAI()}
            className="min-h-[44px] bg-brand-teal hover:bg-brand-teal/90"
          >
            Ask
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleAskAI(q)}
              className="text-xs text-brand-teal bg-brand-teal/5 rounded-full px-3 py-1.5 hover:bg-brand-teal/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </Card>

      {/* Health Timeline */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-brand-navy mb-3">Health Timeline</h2>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <CategoryChip
            category={"labs" as RecordCategory}
            count={categoryCounts["labs"]}
            active={filter === "labs"}
            onClick={() => setFilter(filter === "labs" ? null : "labs")}
          />
          <CategoryChip
            category={"medications" as RecordCategory}
            count={categoryCounts["medications"]}
            active={filter === "medications"}
            onClick={() =>
              setFilter(filter === "medications" ? null : "medications")
            }
          />
          <CategoryChip
            category={"conditions" as RecordCategory}
            count={categoryCounts["conditions"]}
            active={filter === "conditions"}
            onClick={() =>
              setFilter(filter === "conditions" ? null : "conditions")
            }
          />
          <CategoryChip
            category={"visits" as RecordCategory}
            count={categoryCounts["visits"]}
            active={filter === "visits"}
            onClick={() => setFilter(filter === "visits" ? null : "visits")}
          />
        </div>
      </div>

      {/* Timeline cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-brand-teal animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center text-text-muted py-8">No records found.</p>
      ) : (
        <div className="space-y-2 mb-8">
          {filteredRecords.map((record) => (
            <TimelineCard key={record.id} record={record} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        <Button
          variant="outline"
          className="flex flex-col items-center gap-1 h-auto py-3 min-h-[44px]"
          onClick={() => router.push("/sharing")}
        >
          <Share2 className="h-4 w-4" />
          <span className="text-xs">Share with caregiver</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-1 h-auto py-3 min-h-[44px]"
          onClick={() => router.push("/sharing")}
        >
          <Link2 className="h-4 w-4" />
          <span className="text-xs">Provider link</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-1 h-auto py-3 min-h-[44px]"
        >
          <FileDown className="h-4 w-4" />
          <span className="text-xs">Export PDF</span>
        </Button>
      </div>
    </AppShell>
  );
}
