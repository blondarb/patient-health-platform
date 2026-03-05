import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryAI } from "@/lib/ai/client";
import { buildAIContext } from "@/lib/ai/context-builder";
import { DisplayRecord, RecordCategory, RecordStatus } from "@/lib/fhir/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, question, conversationHistory } = body;

  if (!userId || !question) {
    return NextResponse.json(
      { error: "userId and question are required" },
      { status: 400 }
    );
  }

  // Fetch patient records
  const cachedRecords = await prisma.cachedRecord.findMany({
    where: { userId },
    orderBy: { effectiveDate: "desc" },
  });

  // Convert to DisplayRecord format
  const displayRecords: DisplayRecord[] = cachedRecords.map((r) => ({
    id: r.id,
    resourceType: r.resourceType,
    fhirId: r.fhirId,
    category: r.category as RecordCategory,
    title: r.title,
    summary: r.summary || undefined,
    effectiveDate: r.effectiveDate.toISOString(),
    source: r.source,
    facility: r.facility || undefined,
    provider: r.provider || undefined,
    status: r.status as RecordStatus,
    numericValue: r.numericValue || undefined,
    unit: r.unit || undefined,
    refRangeLow: r.refRangeLow || undefined,
    refRangeHigh: r.refRangeHigh || undefined,
    data: r.data,
  }));

  // Build AI context
  const { contextJson, selectedIds } = buildAIContext(displayRecords, question);

  try {
    const aiResponse = await queryAI(question, contextJson, conversationHistory || []);

    // Save to user history
    const savedQuery = await prisma.aIQuery.create({
      data: {
        userId,
        question,
        answer: aiResponse.answer,
        sourceData: JSON.stringify(selectedIds),
        confidence: aiResponse.confidence,
      },
    });

    // Log analytics (stub — logs to console in prototype)
    console.log("[AI Query Analytics]", {
      userId,
      recordCount: selectedIds.length,
      confidence: aiResponse.confidence,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      id: savedQuery.id,
      answer: aiResponse.answer,
      confidence: aiResponse.confidence,
      sourceRecordIds: selectedIds,
    });
  } catch (error) {
    console.error("[AI Query Error]", error);
    return NextResponse.json(
      { error: "AI query failed. Please try again." },
      { status: 500 }
    );
  }
}
