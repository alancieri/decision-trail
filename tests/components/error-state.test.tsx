import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "../../src/components/new-decision/states/error-state";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      errorTitle: "Something went wrong",
      errorMessage: "We couldn't analyze your input.",
      errorHelp: "If the problem persists, continue without AI.",
      retryButton: "Try again",
      continueManuallyButton: "Continue without AI",
    };
    return translations[key] || key;
  },
}));

describe("ErrorState", () => {
  const mockOnRetry = vi.fn();
  const mockOnContinueManually = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error message", () => {
    render(
      <ErrorState
        onRetry={mockOnRetry}
        onContinueManually={mockOnContinueManually}
      />
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("We couldn't analyze your input.")
    ).toBeInTheDocument();
  });

  it("renders retry button and calls onRetry when clicked", () => {
    render(
      <ErrorState
        onRetry={mockOnRetry}
        onContinueManually={mockOnContinueManually}
      />
    );

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it("renders continue manually button and calls onContinueManually when clicked", () => {
    render(
      <ErrorState
        onRetry={mockOnRetry}
        onContinueManually={mockOnContinueManually}
      />
    );

    const continueButton = screen.getByRole("button", {
      name: /continue without ai/i,
    });
    expect(continueButton).toBeInTheDocument();

    fireEvent.click(continueButton);
    expect(mockOnContinueManually).toHaveBeenCalledTimes(1);
  });

  it("shows help text", () => {
    render(
      <ErrorState
        onRetry={mockOnRetry}
        onContinueManually={mockOnContinueManually}
      />
    );

    expect(
      screen.getByText("If the problem persists, continue without AI.")
    ).toBeInTheDocument();
  });

  it("shows error icon", () => {
    const { container } = render(
      <ErrorState
        onRetry={mockOnRetry}
        onContinueManually={mockOnContinueManually}
      />
    );

    // AlertCircle icon should be present (check for SVG)
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });
});
