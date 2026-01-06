"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InputStateProps {
  freeText: string;
  onFreeTextChange: (value: string) => void;
  onAnalyze: () => void;
}

const MIN_CHARS = 10;
const MAX_CHARS = 5000;

// Quick suggestions for ISMS-related decisions
const SUGGESTIONS = [
  { key: "vendor", labelKey: "suggestions.vendor" },
  { key: "policy", labelKey: "suggestions.policy" },
  { key: "incident", labelKey: "suggestions.incident" },
  { key: "tool", labelKey: "suggestions.tool" },
] as const;

export function InputState({
  freeText,
  onFreeTextChange,
  onAnalyze,
}: InputStateProps) {
  const t = useTranslations("newDecision");

  const canAnalyze = freeText.trim().length >= MIN_CHARS;
  const charCount = freeText.length;

  const handleSuggestionClick = (suggestionKey: string) => {
    const example = t(`examples.${suggestionKey}`);
    onFreeTextChange(example);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        {/* Title */}
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {t("title")}
        </h1>
        <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
          {t("subtitle")}
        </p>

        {/* Textarea styled as search bar */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-4">
            <Sparkles className="w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
          </div>
          <Textarea
            value={freeText}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                onFreeTextChange(e.target.value);
              }
            }}
            placeholder={t("placeholder")}
            className="min-h-[120px] pl-12 pr-4 pt-4 pb-16 text-base resize-none rounded-2xl border-2 transition-colors focus:border-primary/50"
            autoFocus
          />
          {/* Footer inside textarea */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span
              className="text-xs tabular-nums"
              style={{ color: "var(--text-tertiary)" }}
            >
              {charCount} / {MAX_CHARS}
            </span>
            <Button
              onClick={onAnalyze}
              disabled={!canAnalyze}
              className="rounded-xl gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t("analyzeButton")}
            </Button>
          </div>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.key}
              onClick={() => handleSuggestionClick(suggestion.key)}
              className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:border-primary/50 hover:bg-muted/50"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {t(suggestion.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
