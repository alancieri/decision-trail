"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  onRetry: () => void;
  onContinueManually: () => void;
}

export function ErrorState({ onRetry, onContinueManually }: ErrorStateProps) {
  const t = useTranslations("newDecision");

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--destructive-bg, #FEE2E2)" }}
          >
            <AlertCircle
              className="w-8 h-8"
              style={{ color: "var(--destructive, #DC2626)" }}
            />
          </div>
        </div>

        {/* Error message */}
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {t("errorTitle")}
        </h2>
        <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
          {t("errorMessage")}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={onRetry} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("retryButton")}
          </Button>
          <Button
            onClick={onContinueManually}
            variant="outline"
            className="w-full gap-2"
          >
            {t("continueManuallyButton")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Help text */}
        <p
          className="mt-6 text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          {t("errorHelp")}
        </p>
      </div>
    </div>
  );
}
