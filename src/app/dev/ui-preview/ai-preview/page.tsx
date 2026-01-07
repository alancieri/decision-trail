"use client";

import { useState } from "react";
import {
  Sparkles,
  ChevronLeft,
  Check,
  X,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Pencil,
  AlertTriangle,
  CircleDot,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// =============================================================================
// MOCK DATA - from user's JSON
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

type AnswerValue = "yes" | "no" | "not_sure";
type SuggestionValue = "not_sure" | "to_review" | "likely_impacted";

// =============================================================================
// VARIANT A: Two-column layout - Content left, Actions right (sticky)
// =============================================================================

function VariantA() {
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [expandedAreas, setExpandedAreas] = useState(true);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b px-6 py-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-semibold" style={{ color: "var(--text-primary)" }}>Analisi AI</h1>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Rivedi e conferma</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <CircleDot className="w-3 h-3" style={{ color: "var(--warning)" }} />
              Bozza
            </Badge>
            <Button className="gap-2">
              Conferma e crea Impact
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Two Column Layout */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN - Summary, Context, Questions, Areas */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Message Bubble - Summary & Context */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--primary)" }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 space-y-4">
                {/* Summary Card */}
                <div className="rounded-2xl rounded-tl-sm p-5" style={{ backgroundColor: "var(--muted)" }}>
                  <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>Titolo Impact</p>
                  <Input
                    defaultValue={mockAIResponse.summary}
                    className="text-lg font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>

                {/* Context */}
                <div className="rounded-2xl rounded-tl-sm p-5" style={{ backgroundColor: "var(--muted)" }}>
                  <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>Contesto di sistema</p>
                  <Textarea
                    defaultValue={mockAIResponse.ai_context}
                    className="text-sm border-0 bg-white/50 dark:bg-black/20 rounded-lg resize-none min-h-[120px]"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "var(--card)" }}>
                <HelpCircle className="w-4 h-4" style={{ color: "var(--primary)" }} />
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>Domande per te</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--muted)", color: "var(--text-tertiary)" }}>
                  {Object.keys(answers).length}/{mockAIResponse.clarifying_questions.length}
                </span>
              </div>

              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {mockAIResponse.clarifying_questions.map((question, idx) => (
                  <div key={idx} className="p-4" style={{ backgroundColor: "var(--background)" }}>
                    <p className="text-sm mb-3" style={{ color: "var(--text-primary)" }}>{question}</p>
                    <div className="flex gap-2 flex-wrap">
                      {(["yes", "no", "not_sure"] as AnswerValue[]).map((value) => (
                        <button
                          key={value}
                          onClick={() => setAnswers(prev => ({ ...prev, [idx]: value }))}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                            answers[idx] === value
                              ? "ring-2 ring-offset-2"
                              : "hover:bg-muted"
                          )}
                          style={{
                            backgroundColor: answers[idx] === value
                              ? value === "yes" ? "var(--success-soft)"
                              : value === "no" ? "var(--error-soft)"
                              : "var(--warning-soft)"
                              : "var(--muted)",
                            color: answers[idx] === value
                              ? value === "yes" ? "var(--success-text)"
                              : value === "no" ? "var(--error-text)"
                              : "var(--warning-text)"
                              : "var(--text-secondary)",
                          }}
                        >
                          {value === "yes" ? "Sì" : value === "no" ? "No" : "Non so"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Le tue risposte aiutano a raffinare le aree impattate.
                </p>
              </div>
            </div>

            {/* Areas Grid - Collapsible */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setExpandedAreas(!expandedAreas)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                style={{ backgroundColor: "var(--card)" }}
              >
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>Aree ISMS</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedAreas && "rotate-180")} style={{ color: "var(--text-tertiary)" }} />
              </button>

              {expandedAreas && (
                <div className="p-4 grid grid-cols-2 gap-2" style={{ backgroundColor: "var(--background)" }}>
                  {Object.entries(mockAIResponse.area_suggestions).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: "var(--muted)" }}
                    >
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {areaLabels[key]}
                      </span>
                      <SuggestionBadge value={value as SuggestionValue} size="sm" />
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Saranno ricalcolate in base alle risposte
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Actions (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "var(--card)" }}>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>Azioni suggerite</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--muted)", color: "var(--text-tertiary)" }}>
                    {mockAIResponse.suggested_actions.length}
                  </span>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {mockAIResponse.suggested_actions.map((action, idx) => (
                    <ActionRow key={idx} action={action} />
                  ))}
                </div>
                <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Seleziona le azioni da includere nell'Impact
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer - Mobile only */}
      <footer className="lg:hidden sticky bottom-0 border-t p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        <Button className="w-full gap-2">
          Conferma e crea Impact
          <ChevronRight className="w-4 h-4" />
        </Button>
      </footer>
    </div>
  );
}

// =============================================================================
// VARIANT B: Card-based / Notion-like
// =============================================================================

function VariantB() {
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Minimal Header */}
      <header className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Indietro
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--warning-soft)", color: "var(--warning-text)" }}>
              Bozza
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        {/* Hero Section */}
        <div className="py-8 border-b mb-8" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm mb-2" style={{ color: "var(--text-tertiary)" }}>Titolo dell'Impact</p>
              <Input
                defaultValue={mockAIResponse.summary}
                className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Context as editable block */}
          <div className="pl-16">
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
              Contesto di sistema
            </p>
            <Textarea
              defaultValue={mockAIResponse.ai_context}
              className="text-base border-0 p-0 focus-visible:ring-0 resize-none min-h-[100px]"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Questions & Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Questions */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
                Domande di chiarimento
              </h2>
              <div className="space-y-3">
                {mockAIResponse.clarifying_questions.map((question, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
                  >
                    <p className="text-sm mb-4" style={{ color: "var(--text-primary)" }}>{question}</p>
                    <div className="flex gap-2">
                      <AnswerPill
                        label="Sì"
                        selected={answers[idx] === "yes"}
                        onClick={() => setAnswers(prev => ({ ...prev, [idx]: "yes" }))}
                        variant="success"
                      />
                      <AnswerPill
                        label="No"
                        selected={answers[idx] === "no"}
                        onClick={() => setAnswers(prev => ({ ...prev, [idx]: "no" }))}
                        variant="error"
                      />
                      <AnswerPill
                        label="Non so"
                        selected={answers[idx] === "not_sure"}
                        onClick={() => setAnswers(prev => ({ ...prev, [idx]: "not_sure" }))}
                        variant="warning"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Actions */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
                Azioni suggerite
              </h2>
              <div className="space-y-3">
                {mockAIResponse.suggested_actions.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border group"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox defaultChecked className="mt-0.5" />
                      <div className="flex-1">
                        <Input
                          defaultValue={action.description}
                          className="text-sm border-0 p-0 h-auto focus-visible:ring-0 font-medium"
                          style={{ color: "var(--text-primary)" }}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <Select defaultValue={action.area_key || "__none__"}>
                            <SelectTrigger className="h-7 text-xs w-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Nessuna area</SelectItem>
                              {Object.entries(areaLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Areas */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
              Aree ISMS
            </h2>
            <div className="space-y-2">
              {Object.entries(mockAIResponse.area_suggestions).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {areaLabels[key]}
                  </span>
                  <SuggestionBadge value={value as SuggestionValue} size="sm" />
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: "var(--text-tertiary)" }}>
              Le aree saranno ricalcolate in base alle tue risposte
            </p>
          </div>
        </div>
      </main>

      {/* Floating Footer */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <Button variant="ghost" size="sm">Annulla</Button>
          <div className="w-px h-6" style={{ backgroundColor: "var(--border)" }} />
          <Button size="sm" className="gap-2">
            <Check className="w-4 h-4" />
            Conferma Impact
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// VARIANT C: Linear-style / Minimal
// =============================================================================

function VariantC() {
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [actionsIncluded, setActionsIncluded] = useState<Record<number, boolean>>(
    Object.fromEntries(mockAIResponse.suggested_actions.map((_, i) => [i, true]))
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "var(--background)" }}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm">
              <X className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Nuovo Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Bozza</Badge>
            <Button size="sm">Crea</Button>
          </div>
        </header>

        <main className="px-6 py-8 space-y-10">
          {/* Title */}
          <div>
            <Input
              defaultValue={mockAIResponse.summary}
              className="text-2xl font-semibold border-0 p-0 h-auto focus-visible:ring-0"
              style={{ color: "var(--text-primary)" }}
              placeholder="Titolo..."
            />
          </div>

          {/* Context */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: "var(--text-tertiary)" }}>
              Contesto
            </label>
            <Textarea
              defaultValue={mockAIResponse.ai_context}
              className="text-sm border-0 p-0 focus-visible:ring-0 resize-none"
              style={{ color: "var(--text-secondary)" }}
              placeholder="Descrivi il contesto..."
            />
          </div>

          {/* Divider */}
          <div className="h-px" style={{ backgroundColor: "var(--border)" }} />

          {/* Questions - Inline style */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-4 block" style={{ color: "var(--text-tertiary)" }}>
              Domande ({Object.keys(answers).length}/{mockAIResponse.clarifying_questions.length})
            </label>
            <div className="space-y-4">
              {mockAIResponse.clarifying_questions.map((question, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="text-xs font-mono mt-1" style={{ color: "var(--text-tertiary)" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm mb-2" style={{ color: "var(--text-primary)" }}>{question}</p>
                    <div className="flex gap-1">
                      {(["yes", "no", "not_sure"] as AnswerValue[]).map((value) => (
                        <button
                          key={value}
                          onClick={() => setAnswers(prev => ({ ...prev, [idx]: value }))}
                          className={cn(
                            "px-2.5 py-1 rounded text-xs font-medium transition-all",
                            answers[idx] === value ? "ring-1 ring-offset-1" : "opacity-60 hover:opacity-100"
                          )}
                          style={{
                            backgroundColor: answers[idx] === value
                              ? value === "yes" ? "var(--success-soft)"
                              : value === "no" ? "var(--error-soft)"
                              : "var(--warning-soft)"
                              : "var(--muted)",
                            color: answers[idx] === value
                              ? value === "yes" ? "var(--success-text)"
                              : value === "no" ? "var(--error-text)"
                              : "var(--warning-text)"
                              : "var(--text-secondary)",
                          }}
                        >
                          {value === "yes" ? "Sì" : value === "no" ? "No" : "?"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ backgroundColor: "var(--border)" }} />

          {/* Areas - Compact */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-4 block" style={{ color: "var(--text-tertiary)" }}>
              Aree ISMS
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(mockAIResponse.area_suggestions).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: value === "likely_impacted" ? "var(--error-soft)"
                      : value === "to_review" ? "var(--warning-soft)"
                      : "var(--muted)",
                    color: value === "likely_impacted" ? "var(--error-text)"
                      : value === "to_review" ? "var(--warning-text)"
                      : "var(--text-tertiary)",
                  }}
                >
                  {areaLabels[key]}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ backgroundColor: "var(--border)" }} />

          {/* Actions - Checklist style */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-4 block" style={{ color: "var(--text-tertiary)" }}>
              Azioni
            </label>
            <div className="space-y-2">
              {mockAIResponse.suggested_actions.map((action, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-opacity",
                    !actionsIncluded[idx] && "opacity-50"
                  )}
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <Checkbox
                    checked={actionsIncluded[idx]}
                    onCheckedChange={(checked) => setActionsIncluded(prev => ({ ...prev, [idx]: !!checked }))}
                  />
                  <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>
                    {action.description}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--background)", color: "var(--text-tertiary)" }}>
                    {action.area_key ? areaLabels[action.area_key] : "Globale"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

function SuggestionBadge({ value, size = "default" }: { value: SuggestionValue; size?: "sm" | "default" }) {
  const config = {
    not_sure: { label: "Non so", bg: "var(--muted)", text: "var(--text-tertiary)" },
    to_review: { label: "Da valutare", bg: "var(--warning-soft)", text: "var(--warning-text)" },
    likely_impacted: { label: "Probabile impatto", bg: "var(--error-soft)", text: "var(--error-text)" },
  }[value];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}

function AnswerPill({
  label,
  selected,
  onClick,
  variant,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant: "success" | "error" | "warning";
}) {
  const colors = {
    success: { bg: "var(--success-soft)", text: "var(--success-text)", ring: "var(--success)" },
    error: { bg: "var(--error-soft)", text: "var(--error-text)", ring: "var(--error)" },
    warning: { bg: "var(--warning-soft)", text: "var(--warning-text)", ring: "var(--warning)" },
  }[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
        selected ? "ring-2 ring-offset-2" : "hover:opacity-80"
      )}
      style={{
        backgroundColor: selected ? colors.bg : "var(--muted)",
        color: selected ? colors.text : "var(--text-secondary)",
        // @ts-ignore
        "--tw-ring-color": selected ? colors.ring : undefined,
      }}
    >
      {label}
    </button>
  );
}

function ActionRow({ action }: { action: typeof mockAIResponse.suggested_actions[0] }) {
  const [included, setIncluded] = useState(true);

  return (
    <div
      className={cn(
        "p-4 flex items-start gap-3 transition-opacity",
        !included && "opacity-50"
      )}
      style={{ backgroundColor: "var(--background)" }}
    >
      <Checkbox
        checked={included}
        onCheckedChange={(checked) => setIncluded(!!checked)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <Input
          defaultValue={action.description}
          disabled={!included}
          className="text-sm border-0 p-0 h-auto focus-visible:ring-0"
          style={{ color: "var(--text-primary)" }}
        />
        <div className="flex items-center gap-2 mt-2">
          <Select defaultValue={action.area_key || "__none__"} disabled={!included}>
            <SelectTrigger className="h-7 text-xs w-auto">
              <SelectValue placeholder="Seleziona area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Globale</SelectItem>
              {Object.entries(areaLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function AIPreviewPage() {
  const [variant, setVariant] = useState<"A" | "B" | "C">("A");
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={cn(darkMode && "dark")}>
      {/* Variant Switcher */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 p-2 rounded-xl border shadow-lg" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <span className="text-xs font-medium px-2" style={{ color: "var(--text-tertiary)" }}>Variante:</span>
        {(["A", "B", "C"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={cn(
              "w-8 h-8 rounded-lg text-sm font-semibold transition-all",
              variant === v
                ? "text-white"
                : "hover:bg-muted"
            )}
            style={{
              backgroundColor: variant === v ? "var(--primary)" : undefined,
              color: variant === v ? "white" : "var(--text-secondary)",
            }}
          >
            {v}
          </button>
        ))}
        <div className="w-px h-6 mx-1" style={{ backgroundColor: "var(--border)" }} />
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Render Selected Variant */}
      {variant === "A" && <VariantA />}
      {variant === "B" && <VariantB />}
      {variant === "C" && <VariantC />}
    </div>
  );
}
