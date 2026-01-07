"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  ChevronLeft,
  ChevronDown,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ImpactAssistResponse } from "@/types/ai";

// =============================================================================
// TYPES
// =============================================================================

export type AnswerValue = "yes" | "no" | "not_sure" | string;

type MessageType =
  | { type: "ai-intro"; summary: string }
  | { type: "ai-context"; context: string }
  | { type: "ai-question"; questionIndex: number; question: string }
  | { type: "user-answer"; questionIndex: number; answer: AnswerValue }
  | { type: "ai-thinking" };

interface ChatStateProps {
  aiResponse: ImpactAssistResponse;
  onComplete: (answers: Record<number, AnswerValue>) => void;
  onBack: () => void;
}

// =============================================================================
// TYPING EFFECT HOOK
// =============================================================================

function useTypingEffect(text: string, speed: number = 20, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);
  const [isComplete, setIsComplete] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
}

// =============================================================================
// MESSAGE COMPONENTS
// =============================================================================

function AIAvatar({ pulse = false }: { pulse?: boolean }) {
  return (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
      pulse && "animate-pulse"
    )} style={{ backgroundColor: "var(--primary)" }}>
      <Sparkles className="w-4 h-4 text-white" />
    </div>
  );
}

function AIMessage({ children, animate = true }: { children: React.ReactNode; animate?: boolean }) {
  return (
    <div className={cn(
      "flex gap-3 items-start",
      animate && "animate-in fade-in slide-in-from-bottom-2 duration-300"
    )}>
      <AIAvatar />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div
        className="px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]"
        style={{ backgroundColor: "var(--primary)", color: "white" }}
      >
        {children}
      </div>
    </div>
  );
}

function ThinkingIndicator({ t }: { t: (key: string) => string }) {
  return (
    <AIMessage>
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl rounded-tl-sm"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span style={{ color: "var(--text-tertiary)" }}>{t("thinking")}</span>
      </div>
    </AIMessage>
  );
}

function IntroMessage({
  summary,
  onComplete,
  t
}: {
  summary: string;
  onComplete: () => void;
  t: (key: string) => string;
}) {
  const [hasCalledComplete, setHasCalledComplete] = useState(false);
  const { displayedText, isComplete } = useTypingEffect(summary, 15);

  useEffect(() => {
    if (isComplete && !hasCalledComplete) {
      const timer = setTimeout(() => {
        setHasCalledComplete(true);
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isComplete, hasCalledComplete, onComplete]);

  return (
    <AIMessage>
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
          {t("analyzing")}
        </p>
        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
          {displayedText}
          {!isComplete && <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />}
        </p>
      </div>
    </AIMessage>
  );
}

function ContextMessage({
  context,
  onComplete,
  t
}: {
  context: string;
  onComplete: () => void;
  t: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hasCalledComplete, setHasCalledComplete] = useState(false);
  const shortContext = context.length > 150 ? context.slice(0, 150) + "..." : context;
  const { displayedText, isComplete } = useTypingEffect(shortContext, 12);

  useEffect(() => {
    if (isComplete && !hasCalledComplete) {
      const timer = setTimeout(() => {
        setHasCalledComplete(true);
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, hasCalledComplete, onComplete]);

  return (
    <AIMessage>
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
          {t("systemContext")}
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          {expanded ? context : displayedText}
          {!isComplete && !expanded && <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />}
        </p>
        {isComplete && context.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium mt-2 flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: "var(--primary)" }}
          >
            {expanded ? t("readLess") : t("readMore")}
            <ChevronDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} />
          </button>
        )}
      </div>
    </AIMessage>
  );
}

function QuestionMessage({
  question,
  questionIndex,
  totalQuestions,
  answered,
  t
}: {
  question: string;
  questionIndex: number;
  totalQuestions: number;
  answered?: AnswerValue;
  t: (key: string) => string;
}) {
  const { displayedText, isComplete } = useTypingEffect(question, 15, !answered);

  return (
    <AIMessage animate={!answered}>
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "var(--primary)", color: "white" }}
          >
            {questionIndex + 1}/{totalQuestions}
          </span>
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{t("questionLabel")}</span>
        </div>
        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
          {answered ? question : displayedText}
          {!isComplete && !answered && <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />}
        </p>
      </div>
    </AIMessage>
  );
}

function AnswerButton({
  label,
  variant,
  onClick
}: {
  label: string;
  variant: "success" | "error" | "warning";
  onClick: () => void;
}) {
  const colors = {
    success: { bg: "var(--success-soft)", text: "var(--success-text)" },
    error: { bg: "var(--error-soft)", text: "var(--error-text)" },
    warning: { bg: "var(--warning-soft)", text: "var(--warning-text)" },
  }[variant];

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label}
    </button>
  );
}

function BottomInputBar({
  questionIndex,
  totalQuestions,
  onAnswer,
  onSkip,
  disabled,
  t
}: {
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: AnswerValue) => void;
  onSkip: () => void;
  disabled?: boolean;
  t: (key: string, values?: Record<string, number>) => string;
}) {
  const [customInput, setCustomInput] = useState("");

  const handleSubmit = () => {
    if (customInput.trim()) {
      onAnswer(customInput.trim());
      setCustomInput("");
    }
  };

  return (
    <footer
      className="shrink-0 border-t"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Quick answer buttons */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>{t("quickAnswer")}</span>
          <AnswerButton label={t("answerYes")} variant="success" onClick={() => onAnswer("yes")} />
          <AnswerButton label={t("answerNo")} variant="error" onClick={() => onAnswer("no")} />
          <AnswerButton label={t("answerNotSure")} variant="warning" onClick={() => onAnswer("not_sure")} />

          <div className="flex-1" />

          <button
            onClick={onSkip}
            className="text-sm hover:underline"
            style={{ color: "var(--text-tertiary)" }}
          >
            {t("skipAll")} →
          </button>
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <Input
            placeholder={t("inputPlaceholder")}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={disabled}
            className="flex-1 h-11"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={disabled || !customInput.trim()}
            className="gap-2 h-11"
            size="lg"
          >
            <Send className="w-4 h-4" />
            {t("send")}
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            {t("questionProgress", { current: questionIndex + 1, total: totalQuestions })}
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-colors"
                style={{
                  backgroundColor: i < questionIndex ? "var(--success)"
                    : i === questionIndex ? "var(--primary)"
                    : "var(--muted)"
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function UserAnswerMessage({ answer, t }: { answer: AnswerValue; t: (key: string) => string }) {
  const displayAnswer = answer === "yes" ? t("answerYes")
    : answer === "no" ? t("answerNo")
    : answer === "not_sure" ? t("answerNotSure")
    : answer;

  return <UserMessage>{displayAnswer}</UserMessage>;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChatState({ aiResponse, onComplete, onBack }: ChatStateProps) {
  const t = useTranslations("newDecision.preview.chat");
  const tPreview = useTranslations("newDecision.preview");

  const [messages, setMessages] = useState<MessageType[]>([
    { type: "ai-intro", summary: aiResponse.summary }
  ]);
  const [phase, setPhase] = useState<"intro" | "context" | "questions">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [isThinking, setIsThinking] = useState(false);
  const [readyForNext, setReadyForNext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalQuestions = aiResponse.clarifying_questions.length;
  const answeredQuestions = Object.keys(answers).length;

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Handle phase transitions when readyForNext is set
  useEffect(() => {
    if (!readyForNext) return;
    setReadyForNext(false);

    if (phase === "intro") {
      setPhase("context");
      setMessages(prev => [...prev, { type: "ai-context", context: aiResponse.ai_context }]);
    } else if (phase === "context") {
      if (totalQuestions > 0) {
        setPhase("questions");
        setMessages(prev => [...prev, {
          type: "ai-question",
          questionIndex: 0,
          question: aiResponse.clarifying_questions[0]
        }]);
      } else {
        // No questions, go directly to summary
        onComplete(answers);
      }
    }
  }, [readyForNext, phase, aiResponse, totalQuestions, answers, onComplete]);

  const handleIntroComplete = () => {
    setReadyForNext(true);
  };

  const handleContextComplete = () => {
    setReadyForNext(true);
  };

  const handleAnswer = (questionIndex: number, answer: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setMessages(prev => [...prev, { type: "user-answer", questionIndex, answer }]);

    // Small delay then show thinking, then next message
    setTimeout(() => {
      if (questionIndex < totalQuestions - 1) {
        setIsThinking(true);
        setTimeout(() => {
          setIsThinking(false);
          const nextIndex = questionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setMessages(prev => [...prev, {
            type: "ai-question",
            questionIndex: nextIndex,
            question: aiResponse.clarifying_questions[nextIndex]
          }]);
        }, 800);
      } else {
        // All questions answered, go to summary
        setIsThinking(true);
        setTimeout(() => {
          setIsThinking(false);
          onComplete({ ...answers, [questionIndex]: answer });
        }, 1000);
      }
    }, 300);
  };

  const handleSkipQuestions = () => {
    // Mark remaining as not_sure
    const newAnswers = { ...answers };
    for (let i = answeredQuestions; i < totalQuestions; i++) {
      newAnswers[i] = "not_sure";
    }
    setAnswers(newAnswers);
    onComplete(newAnswers);
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity mb-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            {tPreview("backButton")}
          </button>
          {messages.map((message, idx) => {
            switch (message.type) {
              case "ai-intro":
                return (
                  <IntroMessage
                    key={idx}
                    summary={message.summary}
                    onComplete={handleIntroComplete}
                    t={t}
                  />
                );
              case "ai-context":
                return (
                  <ContextMessage
                    key={idx}
                    context={message.context}
                    onComplete={handleContextComplete}
                    t={t}
                  />
                );
              case "ai-question":
                return (
                  <QuestionMessage
                    key={idx}
                    question={message.question}
                    questionIndex={message.questionIndex}
                    totalQuestions={totalQuestions}
                    answered={answers[message.questionIndex]}
                    t={t}
                  />
                );
              case "user-answer":
                return <UserAnswerMessage key={idx} answer={message.answer} t={t} />;
              default:
                return null;
            }
          })}

          {isThinking && <ThinkingIndicator t={t} />}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Bottom Input Bar - visible during questions phase */}
      {phase === "questions" && !isThinking && (
        <BottomInputBar
          questionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          onAnswer={(answer) => handleAnswer(currentQuestionIndex, answer)}
          onSkip={handleSkipQuestions}
          disabled={isThinking}
          t={t}
        />
      )}
    </div>
  );
}
