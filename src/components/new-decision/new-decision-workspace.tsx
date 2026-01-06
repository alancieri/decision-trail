"use client";

import { useState, useCallback } from "react";
import { InputState } from "./states/input-state";
import { ProcessingState } from "./states/processing-state";
import { ErrorState } from "./states/error-state";
import { analyzeDecision, ImpactAssistError } from "@/lib/api/impact-assist";
import type {
  NewDecisionState,
  ImpactAssistResponse,
  NewDecisionPreviewState,
} from "@/types/ai";

interface NewDecisionWorkspaceProps {
  workspaceId: string;
}

export function NewDecisionWorkspace({ workspaceId }: NewDecisionWorkspaceProps) {
  // Core state
  const [state, setState] = useState<NewDecisionState>("input");
  const [freeText, setFreeText] = useState("");

  // AI response (will be used in U4 for preview)
  const [, setAiResponse] = useState<ImpactAssistResponse | null>(null);
  const [, setPreviewState] = useState<NewDecisionPreviewState | null>(null);

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

      // Transform AI response into editable preview state
      setPreviewState({
        originalFreeText: freeText.trim(),
        summary: response.summary,
        aiContext: response.ai_context,
        clarifyingQuestions: response.clarifying_questions,
        areaSuggestions: response.area_suggestions,
        draftActions: response.suggested_actions.map((action) => ({
          description: action.description,
          area_key: action.area_key,
          included: true, // All actions included by default
        })),
      });

      setState("preview");
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

  // Handle "Continue without AI" - go to preview with empty state
  const handleContinueManually = useCallback(() => {
    setAiResponse(null);

    // Create empty preview state for manual entry
    setPreviewState({
      originalFreeText: freeText.trim(),
      summary: "", // User fills this
      aiContext: "", // User fills this
      clarifyingQuestions: [], // No AI questions
      areaSuggestions: {
        // All areas start as to_review
        asset_tools: "to_review",
        information_data: "to_review",
        access_privileges: "to_review",
        process_controls: "to_review",
        risk_impact: "to_review",
        policies_docs: "to_review",
        people_awareness: "to_review",
      },
      draftActions: [], // No suggested actions
    });

    setState("preview");
  }, [freeText]);

  // Handle going back to input
  const handleBackToInput = useCallback(() => {
    setState("input");
  }, []);

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

    case "preview":
      // U4 will implement the preview state
      // For now, show a placeholder that allows going back
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center">
            <p style={{ color: "var(--text-secondary)" }}>
              Preview state (U4) - Coming soon
            </p>
            <button
              onClick={handleBackToInput}
              className="mt-4 text-primary underline"
            >
              Back to input
            </button>
          </div>
        </div>
      );

    case "creating":
      // U5 will implement the creating state
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p style={{ color: "var(--text-secondary)" }}>Creating impact...</p>
        </div>
      );

    default:
      return null;
  }
}
