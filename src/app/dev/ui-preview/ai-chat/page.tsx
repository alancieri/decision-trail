"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ChevronLeft,
  Check,
  X,
  Send,
  ChevronRight,
  ChevronDown,
  Loader2,
  MessageCircle,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// =============================================================================
// MOCK DATA - same as ai-preview
// =============================================================================

const mockAIResponse = {
  summary: "Decisione: Sostituzione di Notion con Jira come strumento di project management.",
  ai_context: "Il passaggio a Jira comporta un cambiamento nell'accesso e nella gestione dei progetti. Gli utenti dovranno essere formati su Jira, poiché le funzionalità e l'interfaccia differiscono da Notion. Potrebbero esserci problemi di integrazione con strumenti esistenti come Slack o CI/CD, che necessitano di revisione. I dati attuali in Notion devono essere migrati, il che implica decidere cosa trasferire e cosa archiviare. È possibile che gli utenti continuino a utilizzare Notion in modalità sola lettura durante la transizione.",
  clarifying_questions: [
    "Quali dati specifici devono essere migrati da Notion a Jira?",
    "Ci sono integrazioni esistenti con Notion che devono essere replicate in Jira?",
    "Chi sarà responsabile della formazione degli utenti su Jira?",
    "Qual è la tempistica prevista per la transizione?",
  ],
  area_suggestions: {
    asset_tools: "likely_impacted",
    information_data: "likely_impacted",
    access_privileges: "to_review",
    process_controls: "likely_impacted",
    risk_impact: "to_review",
    policies_docs: "to_review",
    people_awareness: "to_review",
  },
  suggested_actions: [
    {
      description: "Pianificare la migrazione dei dati da Notion a Jira",
      area_key: "information_data",
    },
    {
      description: "Formare gli utenti su come utilizzare Jira",
      area_key: "people_awareness",
    },
    {
      description: "Verificare le integrazioni esistenti con Notion e adattarle per Jira",
      area_key: "process_controls",
    },
  ],
};

const areaLabels: Record<string, string> = {
  asset_tools: "Asset & Strumenti",
  information_data: "Informazioni & Dati",
  access_privileges: "Accessi & Privilegi",
  process_controls: "Processi & Controlli",
  risk_impact: "Rischio & Impatto",
  policies_docs: "Policy & Documentazione",
  people_awareness: "Persone & Awareness",
};

const areaIcons: Record<string, string> = {
  asset_tools: "🔧",
  information_data: "📊",
  access_privileges: "🔐",
  process_controls: "⚙️",
  risk_impact: "⚠️",
  policies_docs: "📋",
  people_awareness: "👥",
};

type AnswerValue = "yes" | "no" | "not_sure" | string;

// =============================================================================
// TYPES
// =============================================================================

type MessageType =
  | { type: "ai-intro"; summary: string }
  | { type: "ai-context"; context: string }
  | { type: "ai-question"; questionIndex: number; question: string }
  | { type: "user-answer"; questionIndex: number; answer: AnswerValue }
  | { type: "ai-thinking" }
  | { type: "ai-summary"; areas: typeof mockAIResponse.area_suggestions; actions: typeof mockAIResponse.suggested_actions };

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

function ThinkingIndicator() {
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
        <span style={{ color: "var(--text-tertiary)" }}>Sto analizzando...</span>
      </div>
    </AIMessage>
  );
}

function IntroMessage({ summary, onComplete }: { summary: string; onComplete: () => void }) {
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
          Ho analizzato la tua decisione
        </p>
        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
          {displayedText}
          {!isComplete && <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />}
        </p>
      </div>
    </AIMessage>
  );
}

function ContextMessage({ context, onComplete }: { context: string; onComplete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [hasCalledComplete, setHasCalledComplete] = useState(false);
  const shortContext = context.slice(0, 150) + "...";
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
          Contesto di sistema
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          {expanded ? context : displayedText}
          {!isComplete && !expanded && <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />}
        </p>
        {isComplete && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium mt-2 flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: "var(--primary)" }}
          >
            {expanded ? "Mostra meno" : "Leggi tutto"}
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
  answered
}: {
  question: string;
  questionIndex: number;
  totalQuestions: number;
  answered?: AnswerValue;
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
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Domanda</span>
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
    success: { bg: "var(--success-soft)", text: "var(--success-text)", hover: "var(--success)" },
    error: { bg: "var(--error-soft)", text: "var(--error-text)", hover: "var(--error)" },
    warning: { bg: "var(--warning-soft)", text: "var(--warning-text)", hover: "var(--warning)" },
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
  currentQuestion,
  questionIndex,
  totalQuestions,
  onAnswer,
  onSkip,
  disabled
}: {
  currentQuestion: string;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: AnswerValue) => void;
  onSkip: () => void;
  disabled?: boolean;
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
      className="sticky bottom-0 border-t"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Quick answer buttons */}
        <div className="flex items-center gap-3 mb-4">
          <span style={{ color: "var(--text-tertiary)" }}>Risposta rapida:</span>
          <AnswerButton label="Sì" variant="success" onClick={() => onAnswer("yes")} />
          <AnswerButton label="No" variant="error" onClick={() => onAnswer("no")} />
          <AnswerButton label="Non so" variant="warning" onClick={() => onAnswer("not_sure")} />

          <div className="flex-1" />

          <button
            onClick={onSkip}
            className="hover:underline"
            style={{ color: "var(--text-tertiary)" }}
          >
            Salta tutte →
          </button>
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <Input
            placeholder="Scrivi una risposta più dettagliata..."
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
            Invia
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mt-3">
          <p style={{ color: "var(--text-tertiary)" }}>
            Domanda {questionIndex + 1} di {totalQuestions}
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

function UserAnswerMessage({ answer }: { answer: AnswerValue }) {
  const displayAnswer = answer === "yes" ? "Sì"
    : answer === "no" ? "No"
    : answer === "not_sure" ? "Non sono sicuro"
    : answer;

  return <UserMessage>{displayAnswer}</UserMessage>;
}

function SummaryPage({
  summary,
  context,
  areas,
  actions,
  onCreateImpact,
  onBack
}: {
  summary: string;
  context: string;
  areas: typeof mockAIResponse.area_suggestions;
  actions: typeof mockAIResponse.suggested_actions;
  onCreateImpact: () => void;
  onBack: () => void;
}) {
  const impactedAreas = Object.entries(areas).filter(([, v]) => v === "likely_impacted");
  const toReviewAreas = Object.entries(areas).filter(([, v]) => v === "to_review");

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-300" style={{ backgroundColor: "var(--background)" }}>
      {/* Minimal header */}
      <header className="px-4 py-4">
        <div className="max-w-xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-tertiary)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Indietro
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 pb-32">

          {/* Hero section */}
          <div className="pt-4 pb-8">
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--primary)" }}>
              Analisi completata
            </p>
            <h1 className="text-base font-semibold leading-snug mb-4" style={{ color: "var(--text-primary)" }}>
              {summary}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {context}
            </p>
          </div>

          {/* Impacted areas */}
          {impactedAreas.length > 0 && (
            <div className="py-6 border-t" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Aree impattate
                <span
                  className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "var(--error-soft)", color: "var(--error-text)" }}
                >
                  {impactedAreas.length}
                </span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {impactedAreas.map(([key]) => (
                  <span
                    key={key}
                    className="text-sm px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "var(--muted)", color: "var(--text-primary)" }}
                  >
                    {areaLabels[key]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Areas to review */}
          {toReviewAreas.length > 0 && (
            <div className="py-6 border-t" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Da verificare
                <span
                  className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "var(--warning-soft)", color: "var(--warning-text)" }}
                >
                  {toReviewAreas.length}
                </span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {toReviewAreas.map(([key]) => (
                  <span
                    key={key}
                    className="text-sm px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "var(--muted)", color: "var(--text-secondary)" }}
                  >
                    {areaLabels[key]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="py-6 border-t" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Azioni suggerite
                <span
                  className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "var(--success-soft)", color: "var(--success-text)" }}
                >
                  {actions.length}
                </span>
              </h2>
              <div className="space-y-3">
                {actions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium"
                      style={{ backgroundColor: "var(--muted)", color: "var(--text-secondary)" }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {action.description}
                      </p>
                      {action.area_key && (
                        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                          {areaLabels[action.area_key]}
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

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, var(--background) 60%, transparent)" }}>
        <div className="max-w-xl mx-auto">
          <Button
            className="w-full gap-2 h-12 text-base"
            onClick={onCreateImpact}
          >
            Crea Impact
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = (current / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--primary)"
          }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-tertiary)" }}>
        {current}/{total}
      </span>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function AIChatPage() {
  const [messages, setMessages] = useState<MessageType[]>([
    { type: "ai-intro", summary: mockAIResponse.summary }
  ]);
  const [phase, setPhase] = useState<"intro" | "context" | "questions" | "summary">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [isThinking, setIsThinking] = useState(false);
  const [readyForNext, setReadyForNext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalQuestions = mockAIResponse.clarifying_questions.length;
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
      setMessages(prev => [...prev, { type: "ai-context", context: mockAIResponse.ai_context }]);
    } else if (phase === "context") {
      setPhase("questions");
      setMessages(prev => [...prev, {
        type: "ai-question",
        questionIndex: 0,
        question: mockAIResponse.clarifying_questions[0]
      }]);
    }
  }, [readyForNext, phase]);

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
            question: mockAIResponse.clarifying_questions[nextIndex]
          }]);
        }, 800);
      } else {
        // All questions answered, show summary
        showSummary();
      }
    }, 300);
  };

  const showSummary = () => {
    setIsThinking(true);
    setPhase("summary");
    setTimeout(() => {
      setIsThinking(false);
      setMessages(prev => [...prev, {
        type: "ai-summary",
        areas: mockAIResponse.area_suggestions,
        actions: mockAIResponse.suggested_actions
      }]);
    }, 1500);
  };

  const handleSkipQuestions = () => {
    // Mark remaining as not_sure
    const newAnswers = { ...answers };
    for (let i = answeredQuestions; i < totalQuestions; i++) {
      newAnswers[i] = "not_sure";
    }
    setAnswers(newAnswers);
    showSummary();
  };

  const handleCreateImpact = () => {
    alert("🎉 Impact creato! (questo è un mock)");
  };

  const handleBackToChat = () => {
    // Reset to questions phase
    setPhase("questions");
    // Remove summary message
    setMessages(prev => prev.filter(m => m.type !== "ai-summary"));
  };

  // Show SummaryPage when in summary phase and not thinking
  if (phase === "summary" && !isThinking) {
    return (
      <SummaryPage
        summary={mockAIResponse.summary}
        context={mockAIResponse.ai_context}
        areas={mockAIResponse.area_suggestions}
        actions={mockAIResponse.suggested_actions}
        onCreateImpact={handleCreateImpact}
        onBack={handleBackToChat}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon-sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  Nuova Decisione
                </h1>
              </div>
            </div>
            <Badge variant="secondary">
              Bozza
            </Badge>
          </div>
          <ProgressBar current={answeredQuestions} total={totalQuestions} />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message, idx) => {
            switch (message.type) {
              case "ai-intro":
                return (
                  <IntroMessage
                    key={idx}
                    summary={message.summary}
                    onComplete={handleIntroComplete}
                  />
                );
              case "ai-context":
                return (
                  <ContextMessage
                    key={idx}
                    context={message.context}
                    onComplete={handleContextComplete}
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
                  />
                );
              case "user-answer":
                return <UserAnswerMessage key={idx} answer={message.answer} />;
              default:
                return null;
            }
          })}

          {isThinking && <ThinkingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Bottom Input Bar - visible during questions phase */}
      {phase === "questions" && !isThinking && (
        <BottomInputBar
          currentQuestion={mockAIResponse.clarifying_questions[currentQuestionIndex] || ""}
          questionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          onAnswer={(answer) => handleAnswer(currentQuestionIndex, answer)}
          onSkip={handleSkipQuestions}
          disabled={isThinking}
        />
      )}
    </div>
  );
}
