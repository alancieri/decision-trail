import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProcessingState } from "../../src/components/new-decision/states/processing-state";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      processing: "Analyzing your input...",
      processingHint: "AI is identifying potential ISMS impacts",
    };
    return translations[key] || key;
  },
}));

describe("ProcessingState", () => {
  it("renders processing message", () => {
    render(<ProcessingState freeText="Test input text" />);

    expect(screen.getByText("Analyzing your input...")).toBeInTheDocument();
    expect(
      screen.getByText("AI is identifying potential ISMS impacts")
    ).toBeInTheDocument();
  });

  it("shows preview of the input text", () => {
    render(<ProcessingState freeText="Test input text" />);

    expect(screen.getByText('"Test input text"')).toBeInTheDocument();
  });

  it("truncates long input text with ellipsis", () => {
    const longText = "A".repeat(150);
    render(<ProcessingState freeText={longText} />);

    // Should show first 100 chars + "..."
    const expectedPreview = `"${"A".repeat(100)}..."`;
    expect(screen.getByText(expectedPreview)).toBeInTheDocument();
  });

  it("shows spinner icon", () => {
    const { container } = render(<ProcessingState freeText="Test" />);

    // Check for animate-spin class (loader icon)
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows sparkles icon", () => {
    const { container } = render(<ProcessingState freeText="Test" />);

    // Check for animate-pulse class (sparkles icon)
    const sparkles = container.querySelector(".animate-pulse");
    expect(sparkles).toBeInTheDocument();
  });
});
