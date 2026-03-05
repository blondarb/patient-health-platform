import { DisplayRecord, RecordCategory } from "@/lib/fhir/types";

const MAX_CONTEXT_RECORDS = 30;

/**
 * Select the most relevant records for AI context given a user query.
 * Prioritizes: matching categories, recent records, abnormal/critical results.
 */
export function buildAIContext(
  records: DisplayRecord[],
  query: string
): { contextJson: string; selectedIds: string[] } {
  const queryLower = query.toLowerCase();

  // Score each record for relevance
  const scored = records.map((record) => {
    let score = 0;

    // Category relevance
    if (queryLower.includes("lab") || queryLower.includes("result") || queryLower.includes("test")) {
      if (record.category === "labs") score += 10;
    }
    if (queryLower.includes("medication") || queryLower.includes("med") || queryLower.includes("drug")) {
      if (record.category === "medications") score += 10;
    }
    if (queryLower.includes("condition") || queryLower.includes("diagnosis")) {
      if (record.category === "conditions") score += 10;
    }
    if (queryLower.includes("allerg")) {
      if (record.category === "allergies") score += 10;
    }

    // Title match
    const titleWords = record.title.toLowerCase().split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    for (const tw of titleWords) {
      if (queryWords.some((qw) => tw.includes(qw) || qw.includes(tw))) {
        score += 5;
      }
    }

    // Abnormal/critical results are always relevant
    if (record.status === "critical") score += 8;
    if (record.status === "abnormal") score += 4;

    // Recency (more recent = higher score)
    if (record.effectiveDate) {
      const daysAgo =
        (Date.now() - new Date(record.effectiveDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo < 30) score += 5;
      else if (daysAgo < 90) score += 3;
      else if (daysAgo < 365) score += 1;
    }

    // Active conditions and medications always included
    if (record.status === "active") score += 3;

    return { record, score };
  });

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, MAX_CONTEXT_RECORDS);

  // Build a clean context JSON (not raw FHIR — simplified for AI)
  const contextRecords = selected.map(({ record }) => ({
    category: record.category,
    title: record.title,
    date: record.effectiveDate,
    value: record.numericValue,
    unit: record.unit,
    status: record.status,
    refRange:
      record.refRangeLow !== undefined && record.refRangeHigh !== undefined
        ? `${record.refRangeLow}-${record.refRangeHigh}`
        : undefined,
    facility: record.facility,
    provider: record.provider,
    summary: record.summary,
  }));

  return {
    contextJson: JSON.stringify(contextRecords, null, 2),
    selectedIds: selected.map(({ record }) => record.id),
  };
}
