import { NextRequest, NextResponse } from "next/server";
import { queryAI } from "@/lib/ai/client";
import { buildAIContext } from "@/lib/ai/context-builder";
import { getAllRecordsForUser } from "@/lib/static-data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, question, conversationHistory } = body;

  if (!userId || !question) {
    return NextResponse.json(
      { error: "userId and question are required" },
      { status: 400 }
    );
  }

  const displayRecords = getAllRecordsForUser(userId);
  const { contextJson, selectedIds } = buildAIContext(displayRecords, question);

  try {
    const aiResponse = await queryAI(question, contextJson, conversationHistory || []);

    return NextResponse.json({
      id: `ai-${Date.now()}`,
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
