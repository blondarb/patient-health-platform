"use client";

import { use } from "react";
import useSWR from "swr";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/health/StatusBadge";
import { AIResponseCard } from "@/components/health/AIResponseCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, HeartPulse, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ConditionDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const onsetDate = record.effectiveDate
    ? format(
        parseISO(
          typeof record.effectiveDate === "string"
            ? record.effectiveDate
            : new Date(record.effectiveDate).toISOString()
        ),
        "MMMM d, yyyy"
      )
    : "Unknown";

  return (
    <AppShell>
      <Link
        href="/records"
        className="flex items-center gap-1 text-sm text-brand-teal hover:underline mb-4 min-h-[44px]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Records
      </Link>

      <Card className="p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-brand-navy/10 shrink-0">
            <HeartPulse className="h-5 w-5 text-brand-navy" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-brand-navy">{record.title}</h1>
              <StatusBadge status={record.status} />
            </div>
            <p className="text-sm text-text-muted mt-1">
              Onset: {onsetDate}
              {record.facility ? ` • ${record.facility}` : ""}
            </p>
          </div>
        </div>
      </Card>

      <AIResponseCard
        answer={`${record.title} is currently listed as ${record.status} in your records${
          record.facility ? `, recorded by ${record.facility}` : ""
        }. This condition was first documented on ${onsetDate}.`}
        confidence="high"
        className="mb-4"
      />

      <Button
        onClick={() =>
          router.push(`/ai?q=${encodeURIComponent(`Tell me about my ${record.title}`)}`)
        }
        className="w-full min-h-[48px] bg-brand-teal hover:bg-brand-teal/90"
      >
        <Brain className="h-4 w-4 mr-2" />
        Ask AI about this condition
      </Button>
    </AppShell>
  );
}
