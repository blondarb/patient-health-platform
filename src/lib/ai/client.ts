import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "./system-prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export interface AIResponse {
  answer: string;
  confidence: "high" | "medium" | "low";
  sourceDataIds: string[];
}

export async function queryAI(
  question: string,
  patientRecordsJson: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(patientRecordsJson);

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...conversationHistory,
    { role: "user", content: question },
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const answerText =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Determine confidence based on content
  const confidence = determineConfidence(answerText, patientRecordsJson);

  return {
    answer: answerText,
    confidence,
    sourceDataIds: [],
  };
}

function determineConfidence(
  answer: string,
  records: string
): "high" | "medium" | "low" {
  // High confidence if answer references specific values from records
  const hasSpecificValues = /\d+\.?\d*\s*(mg|%|mL|mEq|pg)/i.test(answer);
  const hasDates = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(answer);
  const recordCount = (records.match(/"resourceType"/g) || []).length;

  if (hasSpecificValues && hasDates && recordCount > 5) return "high";
  if (hasSpecificValues || hasDates) return "medium";
  return "low";
}
