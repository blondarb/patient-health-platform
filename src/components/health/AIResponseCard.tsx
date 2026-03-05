"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bot, ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { useState } from "react";

interface SourceDataPoint {
  label: string;
  value: string;
  date: string;
  facility: string;
}

interface AIResponseCardProps {
  answer: string;
  sourceData?: SourceDataPoint[];
  confidence: "high" | "medium" | "low";
  followUpQuestions?: string[];
  onAskFollowUp?: (question: string) => void;
  className?: string;
}

const confidenceConfig = {
  high: { label: "High confidence", className: "bg-status-normal/10 text-status-normal" },
  medium: { label: "Medium confidence", className: "bg-status-abnormal/10 text-status-abnormal" },
  low: { label: "Low confidence", className: "bg-text-secondary/10 text-text-secondary" },
};

export function AIResponseCard({
  answer,
  sourceData,
  confidence,
  followUpQuestions,
  onAskFollowUp,
  className,
}: AIResponseCardProps) {
  const [showSources, setShowSources] = useState(false);
  const confConfig = confidenceConfig[confidence];

  return (
    <Card className={cn("border-l-4 border-l-brand-teal bg-brand-teal/5 p-4", className)}>
      {/* AI answer */}
      <div className="flex items-start gap-3">
        <Bot className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      </div>

      {/* Source data (collapsible) */}
      {sourceData && sourceData.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-teal hover:text-brand-teal/80 transition-colors min-h-[44px]"
            aria-expanded={showSources}
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Based on your records:
            {showSources ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showSources && (
            <div className="mt-2 space-y-1.5 pl-6">
              {sourceData.map((item, i) => (
                <div key={i} className="text-sm text-text-secondary">
                  <span className="text-text-muted mr-1">•</span>
                  <span className="font-medium">{item.label}:</span> {item.value}
                  <span className="text-text-muted">
                    {" "}
                    ({item.date} — {item.facility})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confidence badge */}
      <div className="mt-3 flex items-center gap-2">
        <Badge variant="outline" className={cn("text-xs", confConfig.className)}>
          {confConfig.label}
        </Badge>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 text-xs text-text-muted italic">
        This is educational information based on your health records. It is not medical advice.
        Always consult your healthcare provider for medical decisions.
      </p>

      {/* Follow-up questions */}
      {followUpQuestions && followUpQuestions.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium text-text-secondary">You might also ask:</p>
          {followUpQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => onAskFollowUp?.(q)}
              className="block text-sm text-brand-teal hover:text-brand-teal/80 transition-colors text-left min-h-[44px] flex items-center"
            >
              → {q}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
