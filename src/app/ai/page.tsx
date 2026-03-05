"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AIResponseCard } from "@/components/health/AIResponseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Brain, Loader2 } from "lucide-react";

const DEMO_USER_ID = "demo-margaret";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  confidence?: "high" | "medium" | "low";
  sourceData?: Array<{ label: string; value: string; date: string; facility: string }>;
  followUpQuestions?: string[];
}

const defaultSuggestions = [
  "Why is my potassium low?",
  "Explain my recent lab results",
  "What medications am I taking and what are they for?",
  "Are any of my medications interacting with each other?",
];

function AIChat() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialQuerySent = useRef(false);

  // Send initial query from URL param
  useEffect(() => {
    if (initialQuery && !initialQuerySent.current) {
      initialQuerySent.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          question: text,
          conversationHistory,
        }),
      });

      if (!res.ok) throw new Error("AI query failed");

      const data = await res.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: data.answer,
        confidence: data.confidence,
        followUpQuestions: generateFollowUps(text),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content:
          "I'm sorry, I wasn't able to process your question right now. Please try again in a moment.",
        confidence: "low",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-6 w-6 text-brand-teal" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-brand-navy">Ask AI</h1>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-brand-teal/30 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-text-primary mb-2">
              Ask about your health records
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              I can help you understand your lab results, medications, and health trends.
            </p>
            <div className="space-y-2">
              {defaultSuggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="block w-full text-left p-3 rounded-lg border border-surface-border hover:bg-surface-bg transition-colors text-sm text-brand-teal min-h-[44px]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="bg-brand-teal text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[90%]">
                <AIResponseCard
                  answer={msg.content}
                  confidence={msg.confidence || "medium"}
                  sourceData={msg.sourceData}
                  followUpQuestions={msg.followUpQuestions}
                  onAskFollowUp={(q) => sendMessage(q)}
                />
              </div>
            </div>
          )
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface-bg rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 className="h-5 w-5 text-brand-teal animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex gap-2 pt-2 border-t border-surface-border">
        <Input
          placeholder="Ask about your health..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          disabled={isLoading}
          className="min-h-[44px]"
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="min-h-[44px] bg-brand-teal hover:bg-brand-teal/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AIPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-brand-teal animate-spin" />
          </div>
        }
      >
        <AIChat />
      </Suspense>
    </AppShell>
  );
}

function generateFollowUps(question: string): string[] {
  const q = question.toLowerCase();
  if (q.includes("creatinine") || q.includes("kidney")) {
    return [
      "What is my eGFR trend?",
      "How does CKD affect my other medications?",
    ];
  }
  if (q.includes("hba1c") || q.includes("diabetes") || q.includes("blood sugar")) {
    return [
      "Is my diabetes getting better or worse?",
      "What medications help control blood sugar?",
    ];
  }
  if (q.includes("medication")) {
    return [
      "What side effects should I watch for?",
      "Why was each medication prescribed?",
    ];
  }
  return [
    "What should I ask my doctor about?",
    "Are there any trends I should know about?",
  ];
}
