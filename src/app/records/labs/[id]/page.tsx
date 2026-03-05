"use client";

import { use } from "react";
import useSWR from "swr";
import { AppShell } from "@/components/layout/AppShell";
import { AIResponseCard } from "@/components/health/AIResponseCard";
import { LabResultCard } from "@/components/health/LabResultCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Plain-language explanations for common lab tests
const labExplanations: Record<string, string> = {
  "HbA1c":
    "HbA1c measures your average blood sugar over the past 2-3 months. It's a key marker for diabetes management. Normal is below 5.7%, prediabetes is 5.7-6.4%, and diabetes is 6.5% or higher.",
  "Creatinine":
    "Creatinine is a waste product filtered by your kidneys. Higher levels may mean your kidneys aren't filtering as well as they should.",
  "eGFR":
    "eGFR estimates how well your kidneys filter waste from your blood. A lower number means less kidney function. Normal is above 90 mL/min.",
  "Potassium":
    "Potassium is an important mineral for your heart and muscles. Both too much and too little can cause problems, including irregular heartbeat.",
  "Glucose":
    "Fasting glucose measures your blood sugar after not eating. It helps screen for diabetes and monitor blood sugar control.",
  "Cholesterol":
    "Cholesterol is a waxy substance in your blood. High levels can increase your risk of heart disease and stroke.",
  "LDL":
    "LDL is often called 'bad' cholesterol because high levels can lead to plaque buildup in your arteries, increasing heart disease risk.",
};

export default function LabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data, isLoading } = useSWR(`/api/records/${id}`, fetcher);

  const record = data?.record;
  const relatedRecords = data?.relatedRecords || [];

  // Build trend data from related records
  const trendData = relatedRecords
    .filter((r: Record<string, unknown>) => r.numericValue !== null)
    .map((r: Record<string, unknown>) => ({
      date: typeof r.effectiveDate === "string"
        ? r.effectiveDate
        : new Date(r.effectiveDate as string).toISOString(),
      value: r.numericValue as number,
    }));

  const explanation = record
    ? Object.entries(labExplanations).find(([key]) =>
        record.title.toLowerCase().includes(key.toLowerCase())
      )?.[1]
    : undefined;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-brand-teal animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!record) {
    return (
      <AppShell>
        <p className="text-center text-text-muted py-8">Record not found.</p>
      </AppShell>
    );
  }

  const date = record.effectiveDate
    ? format(
        parseISO(
          typeof record.effectiveDate === "string"
            ? record.effectiveDate
            : new Date(record.effectiveDate).toISOString()
        ),
        "MMMM d, yyyy"
      )
    : "";

  // Build a simple AI summary for demo
  const aiSummary = buildLabSummary(record);

  return (
    <AppShell>
      {/* Back button */}
      <Link
        href="/records"
        className="flex items-center gap-1 text-sm text-brand-teal hover:underline mb-4 min-h-[44px]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Records
      </Link>

      {/* Header */}
      <h1 className="text-2xl font-bold text-brand-navy">{record.title}</h1>
      <p className="text-sm text-text-muted mb-4">
        {date} {record.facility ? `• ${record.facility}` : ""}
      </p>

      {/* AI Summary */}
      <AIResponseCard
        answer={aiSummary}
        confidence="high"
        className="mb-4"
      />

      {/* Lab result card */}
      <LabResultCard
        record={{
          ...record,
          effectiveDate:
            typeof record.effectiveDate === "string"
              ? record.effectiveDate
              : new Date(record.effectiveDate).toISOString(),
        }}
        trendData={trendData}
        explanation={explanation}
        className="mb-4"
      />

      {/* Ask AI about these results */}
      <Button
        onClick={() =>
          router.push(
            `/ai?q=${encodeURIComponent(`Tell me about my ${record.title} results`)}`
          )
        }
        className="w-full min-h-[48px] bg-brand-teal hover:bg-brand-teal/90"
      >
        <Brain className="h-4 w-4 mr-2" />
        Ask AI about these results
      </Button>
    </AppShell>
  );
}

function buildLabSummary(record: Record<string, unknown>): string {
  const title = record.title as string;
  const value = record.numericValue as number | null;
  const unit = record.unit as string | null;
  const status = record.status as string;
  const low = record.refRangeLow as number | null;
  const high = record.refRangeHigh as number | null;

  if (!value) return `Your ${title} result has been recorded.`;

  let statusText = "";
  if (status === "normal") {
    statusText = "is within the normal range";
  } else if (status === "abnormal") {
    if (low !== null && value < low) statusText = "is below the normal range";
    else statusText = "is above the normal range";
  } else if (status === "critical") {
    if (low !== null && value < low) statusText = "is critically below the safe range";
    else statusText = "is critically above the safe range";
  }

  let summary = `Your ${title} result of ${value} ${unit || ""} ${statusText}.`;

  if (low !== null && high !== null) {
    summary += ` The normal range is ${low}–${high} ${unit || ""}.`;
  }

  if (status === "critical") {
    summary += " Please contact your healthcare provider promptly about this result.";
  } else if (status === "abnormal") {
    summary += " Your doctor may want to discuss this at your next visit.";
  }

  return summary;
}
