"use client";

import { useState, useCallback } from "react";
import { InputState } from "./states/input-state";
import { ProcessingState } from "./states/processing-state";
import { ErrorState } from "./states/error-state";
import { ChatState, type AnswerValue } from "./states/chat-state";
import { SummaryState } from "./states/summary-state";
import { analyzeDecision, ImpactAssistError } from "@/lib/api/impact-assist";
import type { NewDecisionState, ImpactAssistResponse } from "@/types/ai";

interface NewDecisionWorkspaceProps {
  workspaceId: string;
}

export function NewDecisionWorkspace({ workspaceId }: NewDecisionWorkspaceProps) {
  // Core state
  const [state, setState] = useState<NewDecisionState>("input");
  const [freeText, setFreeText] = useState("");

  // AI response
  const [aiResponse, setAiResponse] = useState<ImpactAssistResponse | null>(null);

  // Answers to clarifying questions
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});

  // Handle analyze button click
  const handleAnalyze = useCallback(async () => {
    if (!freeText.trim()) return;

    setState("processing");

    try {
      const response = await analyzeDecision({
        freeText: freeText.trim(),
        workspaceId,
      });

      setAiResponse(response);
      setState("chat");
    } catch (error) {
      console.error("Failed to analyze decision:", error);

      if (error instanceof ImpactAssistError) {
        console.error(`API Error: ${error.status} - ${error.message}`);
      }

      setState("error");
    }
  }, [freeText, workspaceId]);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  // Handle "Continue without AI" - go directly to Impact Detail with empty state
  const handleContinueManually = useCallback(() => {
    // TODO: Create empty Impact and redirect to detail page
    // For now, just go back to input
    setState("input");
  }, []);

  // Handle going back to input
  const handleBackToInput = useCallback(() => {
    setState("input");
    setAiResponse(null);
    setAnswers({});
  }, []);

  // Handle chat completion (all questions answered)
  const handleChatComplete = useCallback((newAnswers: Record<number, AnswerValue>) => {
    setAnswers(newAnswers);
    setState("summary");
  }, []);

  // Handle back from summary to chat
  const handleBackToChat = useCallback(() => {
    setState("chat");
  }, []);

  // Handle continue from summary - create Impact and redirect to detail
  const handleContinueToImpact = useCallback(async () => {
    if (!aiResponse) return;

    setState("creating");

    try {
      // TODO: U5 will implement finalizeImpact() + DB insert
      // For now, simulate creation and redirect
      // const impact = await createImpact({
      //   workspaceId,
      //   summary: aiResponse.summary,
      //   aiContext: aiResponse.ai_context,
      //   areaSuggestions: aiResponse.area_suggestions,
      //   suggestedActions: aiResponse.suggested_actions,
      //   answers,
      //   originalFreeText: freeText,
      // });
      // router.push(`/impacts/${impact.id}`);

      // Temporary: show alert and reset
      alert("Impact created! (This will redirect to Impact Detail in U5)");
      setState("input");
      setFreeText("");
      setAiResponse(null);
      setAnswers({});
    } catch (error) {
      console.error("Failed to create impact:", error);
      setState("summary"); // Go back to summary on error
    }
  }, [aiResponse]);

  // Render based on current state
  switch (state) {
    case "input":
      return (
        <div className="flex-1 flex flex-col">
          <InputState
            freeText={freeText}
            onFreeTextChange={setFreeText}
            onAnalyze={handleAnalyze}
          />
        </div>
      );

    case "processing":
      return (
        <div className="flex-1 flex flex-col">
          <ProcessingState freeText={freeText} />
        </div>
      );

    case "error":
      return (
        <div className="flex-1 flex flex-col">
          <ErrorState
            onRetry={handleRetry}
            onContinueManually={handleContinueManually}
          />
        </div>
      );

    case "chat":
      if (!aiResponse) {
        // Should not happen, but fallback to input
        return (
          <div className="flex-1 flex flex-col">
            <InputState
              freeText={freeText}
              onFreeTextChange={setFreeText}
              onAnalyze={handleAnalyze}
            />
          </div>
        );
      }
      return (
        <ChatState
          aiResponse={aiResponse}
          onComplete={handleChatComplete}
          onBack={handleBackToInput}
        />
      );

    case "summary":
      if (!aiResponse) {
        // Should not happen, but fallback to input
        return (
          <div className="flex-1 flex flex-col">
            <InputState
              freeText={freeText}
              onFreeTextChange={setFreeText}
              onAnalyze={handleAnalyze}
            />
          </div>
        );
      }
      return (
        <SummaryState
          aiResponse={aiResponse}
          onContinue={handleContinueToImpact}
          onBack={handleBackToChat}
        />
      );

    case "creating":
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
            />
            <p style={{ color: "var(--text-secondary)" }}>Creating Impact...</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
