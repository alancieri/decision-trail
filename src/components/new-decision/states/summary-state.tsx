"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImpactAssistResponse, AISuggestionValue } from "@/types/ai";

interface SummaryStateProps {
  aiResponse: ImpactAssistResponse;
  onContinue: () => void;
  onBack: () => void;
}

export function SummaryState({ aiResponse, onContinue, onBack }: SummaryStateProps) {
  const t = useTranslations("newDecision.preview");
  const tChat = useTranslations("newDecision.preview.chat");
  const tArea = useTranslations("area");

  const impactedAreas = Object.entries(aiResponse.area_suggestions).filter(
    ([, v]) => v === "likely_impacted"
  );
  const toReviewAreas = Object.entries(aiResponse.area_suggestions).filter(
    ([, v]) => v === "to_review"
  );

  return (
    <div
      className="flex-1 flex flex-col animate-in fade-in duration-300"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-6">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity mb-6"
            style={{ color: "var(--text-tertiary)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            {t("backButton")}
          </button>

          {/* Hero section */}
          <div className="pb-8">
            <p
              className="text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: "var(--primary)" }}
            >
              {tChat("analysisComplete")}
            </p>
            <h1
              className="font-semibold leading-snug mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              {aiResponse.summary}
            </h1>
            <p
              className="leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {aiResponse.ai_context}
            </p>
          </div>

          {/* Impacted areas */}
          {impactedAreas.length > 0 && (
            <div className="py-6 border-t" style={{ borderColor: "var(--border)" }}>
              <h2
                className="font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {tChat("impactedAreas")}
                <span
                  className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: "var(--error-soft)",
                    color: "var(--error-text)",
                  }}
                >
                  {impactedAreas.length}
                </span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {impactedAreas.map(([key]) => (
                  <span
                    key={key}
                    className="text-sm px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {tArea(`${key}.label`)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Areas to review */}
          {toReviewAreas.length > 0 && (
            <div className="py-6 border-t" style={{ borderColor: "var(--border)" }}>
              <h2
                className="font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {tChat("areasToVerify")}
                <span
                  className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: "var(--warning-soft)",
                    color: "var(--warning-text)",
                  }}
                >
                  {toReviewAreas.length}
                </span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {toReviewAreas.map(([key]) => (
                  <span
                    key={key}
                    className="text-sm px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {tArea(`${key}.label`)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {aiResponse.suggested_actions.length > 0 && (
            <div className="py-6 border-t" style={{ borderColor: "var(--border)" }}>
              <h2
                className="font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                {tChat("suggestedActions")}
                <span
                  className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: "var(--success-soft)",
                    color: "var(--success-text)",
                  }}
                >
                  {aiResponse.suggested_actions.length}
                </span>
              </h2>
              <div className="space-y-3">
                {aiResponse.suggested_actions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--muted)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p style={{ color: "var(--text-primary)" }}>
                        {action.description}
                      </p>
                      {action.area_key && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {tArea(`${action.area_key}.label`)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom CTA */}
      <div
        className="shrink-0 p-4 border-t"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <div className="max-w-xl mx-auto flex justify-end">
          <Button className="gap-2" onClick={onContinue}>
            {t("continueButton")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
