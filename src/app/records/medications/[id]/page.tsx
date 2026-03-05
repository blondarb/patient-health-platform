"use client";

import { use } from "react";
import useSWR from "swr";
import { AppShell } from "@/components/layout/AppShell";
import { MedicationCard } from "@/components/health/MedicationCard";
import { AIResponseCard } from "@/components/health/AIResponseCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MedicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useSWR(`/api/records/${id}`, fetcher);

  const record = data?.record;

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

  return (
    <AppShell>
      <Link
        href="/records"
        className="flex items-center gap-1 text-sm text-brand-teal hover:underline mb-4 min-h-[44px]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Records
      </Link>

      <MedicationCard
        record={{
          ...record,
          effectiveDate:
            typeof record.effectiveDate === "string"
              ? record.effectiveDate
              : new Date(record.effectiveDate).toISOString(),
        }}
        className="mb-4"
      />

      <AIResponseCard
        answer={`${record.title} is currently ${record.status}. ${
          record.summary || "Take as directed by your provider."
        }`}
        confidence="high"
        className="mb-4"
      />

      <Button
        onClick={() =>
          router.push(`/ai?q=${encodeURIComponent(`Tell me about ${record.title}`)}`)
        }
        className="w-full min-h-[48px] bg-brand-teal hover:bg-brand-teal/90"
      >
        <Brain className="h-4 w-4 mr-2" />
        Ask AI about this medication
      </Button>
    </AppShell>
  );
}
