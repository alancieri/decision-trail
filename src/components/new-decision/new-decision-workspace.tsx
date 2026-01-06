"use client";

import { useState } from "react";
import { InputState } from "./states/input-state";

interface NewDecisionWorkspaceProps {
  workspaceId: string;
}

export function NewDecisionWorkspace({ workspaceId }: NewDecisionWorkspaceProps) {
  const [freeText, setFreeText] = useState("");

  // For U2, we only have the input state
  // Future states (processing, preview, etc.) will be added in U3-U5
  const handleAnalyze = () => {
    // Will be implemented in U3 when we add the AI integration
    console.log("Analyze clicked - will call AI in U3", { freeText, workspaceId });
  };

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
