import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { buildSystemPrompt } from "./system-prompt";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-2",
});

const MODEL_ID = "us.anthropic.claude-sonnet-4-20250514-v1:0";

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

  const messages = [
    ...conversationHistory,
    { role: "user" as const, content: question },
  ];

  // Bedrock Anthropic models accept the Claude messages API body format directly.
  // The body is identical to the Anthropic API — system, messages, max_tokens, anthropic_version.
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  const response = await bedrock.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  const answerText =
    responseBody.content?.[0]?.type === "text"
      ? responseBody.content[0].text
      : "";

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
