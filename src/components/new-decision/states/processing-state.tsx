"use client";

import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";

interface ProcessingStateProps {
  freeText: string;
}

export function ProcessingState({ freeText }: ProcessingStateProps) {
  const t = useTranslations("newDecision");

  // Show a preview of what's being analyzed (first 100 chars)
  const preview =
    freeText.length > 100 ? `${freeText.substring(0, 100)}...` : freeText;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        {/* Animated icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Sparkles
              className="w-12 h-12 animate-pulse"
              style={{ color: "var(--primary)" }}
            />
            <Loader2
              className="w-6 h-6 absolute -bottom-1 -right-1 animate-spin"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
        </div>

        {/* Processing message */}
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {t("processing")}
        </h2>
        <p className="text-base mb-6" style={{ color: "var(--text-secondary)" }}>
          {t("processingHint")}
        </p>

        {/* Preview of input */}
        <div
          className="p-4 rounded-xl border text-left text-sm"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-secondary)",
          }}
        >
          <p className="italic">&quot;{preview}&quot;</p>
        </div>
      </div>
    </div>
  );
}
