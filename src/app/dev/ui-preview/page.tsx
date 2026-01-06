"use client";

import { useState } from "react";
import {
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Plus,
  ChevronRight,
  ChevronDown,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Check,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ListCard } from "@/components/ui/list-card";
import { UnifiedList, UnifiedListRow } from "@/components/ui/unified-list";
import { cn } from "@/lib/utils";

// ============================================================================
// MOCK DATA
// ============================================================================

const mockImpacts = [
  {
    id: "1",
    title: "Migrazione a nuovo cloud provider",
    description: "Spostamento dell'infrastruttura da AWS a GCP per ottimizzare i costi",
    sourceType: "decision",
    status: "draft",
    areasToReview: 4,
    areasImpacted: 2,
    areasNotImpacted: 1,
    actionsOpen: 3,
    actionsDone: 1,
    updatedAt: "2 ore fa",
  },
  {
    id: "2",
    title: "Data breach - accesso non autorizzato",
    description: "Rilevato accesso non autorizzato al database clienti",
    sourceType: "incident",
    status: "actions_open",
    areasToReview: 0,
    areasImpacted: 5,
    areasNotImpacted: 2,
    actionsOpen: 8,
    actionsDone: 2,
    updatedAt: "1 giorno fa",
  },
  {
    id: "3",
    title: "Nuovo processo di onboarding dipendenti",
    description: "Implementazione procedura standardizzata per nuovi assunti",
    sourceType: "change",
    status: "completed",
    areasToReview: 0,
    areasImpacted: 3,
    areasNotImpacted: 4,
    actionsOpen: 0,
    actionsDone: 5,
    updatedAt: "1 settimana fa",
  },
];

const mockAreas = [
  { id: "policies", name: "Policies", icon: FileText, state: "impacted" as const },
  { id: "organization", name: "Organization", icon: Users, state: "to_review" as const },
  { id: "hr", name: "HR Security", icon: Shield, state: "not_impacted" as const },
  { id: "assets", name: "Asset Management", icon: Building2, state: "to_review" as const },
  { id: "access", name: "Access Control", icon: Shield, state: "impacted" as const },
  { id: "crypto", name: "Cryptography", icon: Shield, state: "to_review" as const },
  { id: "physical", name: "Physical Security", icon: Building2, state: "not_impacted" as const },
];

// Le 7 Aree di Impatto ISO 27001
const impactAreas = [
  {
    id: "organizational",
    name: "Organizational Controls",
    description: "Policies, roles, responsibilities and management commitment to information security.",
    icon: Building2,
    controlsCount: 37,
  },
  {
    id: "people",
    name: "People Controls",
    description: "Human resource security including screening, terms of employment and awareness.",
    icon: Users,
    controlsCount: 8,
  },
  {
    id: "physical",
    name: "Physical Controls",
    description: "Physical and environmental security measures to protect assets and facilities.",
    icon: Shield,
    controlsCount: 14,
  },
  {
    id: "technological",
    name: "Technological Controls",
    description: "Technical measures for access control, cryptography, and system security.",
    icon: Settings,
    controlsCount: 34,
  },
];

const mockActions = [
  { id: "1", title: "Aggiornare policy accesso remoto", area: "Access Control", done: false, dueDate: "15 Gen" },
  { id: "2", title: "Formare team su nuove procedure", area: "HR Security", done: false, dueDate: "20 Gen" },
  { id: "3", title: "Audit log sistema", area: "Asset Management", done: true, dueDate: "10 Gen" },
  { id: "4", title: "Review certificati SSL", area: "Cryptography", done: false, dueDate: "25 Gen" },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function Sidebar() {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "impact", label: "Impact", icon: FileText },
    { id: "action", label: "Action", icon: CheckCircle2 },
    { id: "ui-components", label: "UI Components", icon: Settings },
  ];

  return (
    <aside className="w-60 border-r border-border/50 flex flex-col h-screen sticky top-0" style={{ backgroundColor: "var(--card)" }}>
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Decision Trail</span>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="p-3 border-b border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-9 px-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">AC</span>
                </div>
                <span className="text-sm font-medium truncate">Acme Corp</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Check className="w-4 h-4 mr-2" />
              Acme Corp
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="w-4 h-4 mr-2" />
              Globex Inc
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="w-4 h-4 mr-2" />
              Create workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </a>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  AL
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Alessandro L.</p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Owner</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

// =============================================================================
// BADGES - Pill badges senza bordo
// =============================================================================

// SOURCE TYPE BADGE - Badge con dot colorato per tipo sorgente
function SourceTypeBadge({ type }: { type: string }) {
  const config = {
    decision: {
      label: "Decisione",
      dotColor: "var(--info)",
      bgColor: "var(--info-soft)",
      textColor: "var(--info-text)"
    },
    incident: {
      label: "Incidente",
      dotColor: "var(--error)",
      bgColor: "var(--error-soft)",
      textColor: "var(--error-text)"
    },
    change: {
      label: "Cambiamento",
      dotColor: "var(--warning)",
      bgColor: "var(--warning-soft)",
      textColor: "var(--warning-text)"
    },
  }[type] || { label: type, dotColor: "var(--muted-foreground)", bgColor: "var(--muted)", textColor: "var(--text-secondary)" };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.dotColor }}
      />
      {config.label}
    </span>
  );
}

// STATUS BADGE - Badge per stato workflow
function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: {
      label: "Da valutare",
      bgColor: "var(--state-to-review-soft)",
      textColor: "var(--warning-text)"
    },
    actions_open: {
      label: "Azioni aperte",
      bgColor: "var(--state-impacted-soft)",
      textColor: "var(--error-text)"
    },
    completed: {
      label: "Completato",
      bgColor: "var(--state-not-impacted-soft)",
      textColor: "var(--success-text)"
    },
  }[status] || { label: status, bgColor: "var(--muted)", textColor: "var(--text-secondary)" };

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      {config.label}
    </span>
  );
}

// AREA STATE BADGE - Badge per stato area di controllo
function AreaStateBadge({ state }: { state: "to_review" | "impacted" | "not_impacted" }) {
  const config = {
    to_review: {
      label: "Da valutare",
      bgColor: "var(--state-to-review-soft)",
      textColor: "var(--warning-text)"
    },
    impacted: {
      label: "Impattato",
      bgColor: "var(--state-impacted-soft)",
      textColor: "var(--error-text)"
    },
    not_impacted: {
      label: "Non impattato",
      bgColor: "var(--state-not-impacted-soft)",
      textColor: "var(--success-text)"
    },
  }[state];

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      {config.label}
    </span>
  );
}

// =============================================================================
// STATS CARD - Card statistica cliccabile
// =============================================================================
function StatsCard({ title, value, icon: Icon, trend }: { title: string; value: string | number; icon: React.ElementType; trend?: string }) {
  return (
    <div
      className="border rounded-lg p-5 bg-background hover:border-border/80 hover:shadow-sm transition-all cursor-pointer"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
          <Icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
        </div>
        <h3 className="font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
      </div>

      {/* Value */}
      <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>

      {/* Trend */}
      {trend && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {trend}
        </p>
      )}
    </div>
  );
}

const statsData = [
  { id: "total", title: "Impact totali", value: 12, icon: FileText, trend: "+3 questo mese" },
  { id: "open", title: "Azioni aperte", value: 8, icon: AlertCircle, trend: "Da completare" },
  { id: "review", title: "Aree da valutare", value: 15, icon: Clock },
  { id: "completed", title: "Completati", value: 4, icon: CheckCircle2, trend: "Ultimo: 2 giorni fa" },
];

// =============================================================================
// UNIFIED GRID - Container unificato con divisori interni
// Usato da: StatsGrid, ImpactAreasGrid
// =============================================================================
function StatsGrid() {
  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Dashboard Stats
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y" style={{ borderColor: "var(--border)" }}>
        {statsData.map((stat, index) => (
          <div
            key={stat.id}
            className={cn(
              "p-5 bg-background hover:bg-muted/30 transition-colors cursor-pointer",
              index < 4 && "lg:border-t-0",
              index % 4 === 0 && "lg:border-l-0"
            )}
            style={{ borderColor: "var(--border)" }}
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
                <stat.icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              </div>
              <h3 className="font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>
                {stat.title}
              </h3>
            </div>

            {/* Value */}
            <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {stat.value}
            </div>

            {/* Trend */}
            {stat.trend && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {stat.trend}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// IMPACT LIST - Lista impact con righe in container unificato (usa UnifiedList)
// =============================================================================
function ImpactList() {
  return (
    <UnifiedList>
      {mockImpacts.map((impact) => {
        const sourceTypeLabel = {
          decision: "Decisione",
          incident: "Incidente",
          change: "Cambiamento",
        }[impact.sourceType] || impact.sourceType;

        return (
          <UnifiedListRow
            key={impact.id}
            title={impact.title}
            subtitle={`${sourceTypeLabel} · ${impact.areasImpacted} aree impattate · ${impact.updatedAt}`}
            action={
              <Button variant="secondary">
                View Impact
                <ChevronRight className="w-3 h-3" />
              </Button>
            }
          />
        );
      })}
    </UnifiedList>
  );
}

// =============================================================================
// IMPACT CARD - Card singola impact (usa ListCard)
// =============================================================================
function ImpactCard({ impact }: { impact: typeof mockImpacts[0] }) {
  const sourceTypeLabel = {
    decision: "Decisione",
    incident: "Incidente",
    change: "Cambiamento",
  }[impact.sourceType] || impact.sourceType;

  return (
    <ListCard
      title={impact.title}
      subtitle={`${sourceTypeLabel} · ${impact.areasImpacted} aree impattate · ${impact.updatedAt}`}
      action={
        <Button variant="secondary">
          View Impact
          <ChevronRight className="w-3 h-3" />
        </Button>
      }
    />
  );
}

// =============================================================================
// IMPACT LIST CARDS - Lista impact con card separate
// =============================================================================
function ImpactListCards() {
  return (
    <div className="space-y-3">
      {mockImpacts.map((impact) => (
        <ImpactCard key={impact.id} impact={impact} />
      ))}
    </div>
  );
}

// =============================================================================
// CONTROL AREA GRID - Griglia aree di controllo con stato
// =============================================================================
function ControlAreaGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockAreas.map((area) => (
        <div
          key={area.id}
          className="border rounded-lg p-5 bg-background hover:border-border/80 hover:shadow-sm transition-all cursor-pointer"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
              <area.icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            </div>
            <h3 className="font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>
              {area.name}
            </h3>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <AreaStateBadge state={area.state} />
          </div>

          {/* Footer with action */}
          <Button variant="outline" size="sm" className="w-full">
            Valuta Area
          </Button>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// IMPACT AREA CARD - Card per area di impatto ISO 27001
// =============================================================================
function ImpactAreaCard({ area }: { area: typeof impactAreas[0] }) {
  return (
    <div className="border rounded-lg p-5 bg-background hover:border-border/80 transition-colors" style={{ borderColor: "var(--border)" }}>
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
          <area.icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
        </div>
        <h3 className="font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>
          {area.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
        {area.description}
      </p>

      {/* Footer with action */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {area.controlsCount} controls
        </span>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          Explore
        </Button>
      </div>
    </div>
  );
}

// IMPACT AREAS GRID - Griglia aree ISO 27001 (usa pattern UnifiedGrid)
function ImpactAreasGrid() {
  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Impact Areas
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y" style={{ borderColor: "var(--border)" }}>
        {impactAreas.map((area, index) => (
          <div
            key={area.id}
            className={cn(
              "p-5 bg-background hover:bg-muted/30 transition-colors cursor-pointer",
              index < 4 && "lg:border-t-0",
              index % 4 === 0 && "lg:border-l-0"
            )}
            style={{ borderColor: "var(--border)" }}
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
                <area.icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              </div>
              <h3 className="font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>
                {area.name}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
              {area.description}
            </p>

            {/* Footer with action */}
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Explore Area
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// ACTION LIST UNIFIED - Lista azioni con checkbox in container unificato
// =============================================================================
function ActionListUnified() {
  return (
    <UnifiedList>
      {mockActions.map((action) => (
        <UnifiedListRow
          key={action.id}
          title={action.title}
          subtitle={`${action.area} · Scadenza ${action.dueDate}`}
          showCheckbox
          checked={action.done}
          disabled={action.done}
          action={
            <Button variant="outline" size="sm">
              {action.done ? "Completata" : "Completa"}
            </Button>
          }
        />
      ))}
    </UnifiedList>
  );
}

// =============================================================================
// ACTION LIST - Lista azioni con checkbox (usa ListCard)
// =============================================================================
function ActionList() {
  return (
    <div className="space-y-3">
      {mockActions.map((action) => (
        <ListCard
          key={action.id}
          title={action.title}
          subtitle={`${action.area} · Scadenza ${action.dueDate}`}
          showCheckbox
          checked={action.done}
          disabled={action.done}
          action={
            <Button variant="outline" size="sm">
              {action.done ? "Completata" : "Completa"}
            </Button>
          }
        />
      ))}
    </div>
  );
}

// =============================================================================
// OPTIONAL BADGE - Badge per campi non richiesti
// =============================================================================
function OptionalBadge() {
  return (
    <span
      className="ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded"
      style={{ backgroundColor: "var(--muted)", color: "var(--text-tertiary)" }}
    >
      Optional
    </span>
  );
}

// =============================================================================
// IMPACT FORM - Form creazione nuovo impact
// =============================================================================
function ImpactForm() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Nuovo Impact
        </h2>
        <p className="text-[15px]" style={{ color: "var(--text-secondary)" }}>
          Registra una nuova decisione, incidente o cambiamento che impatta il tuo ISMS.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Titolo */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Titolo
          </Label>
          <Input
            placeholder="Es: Migrazione database a PostgreSQL"
            className="h-10"
          />
        </div>

        {/* Tipo */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Tipo
          </Label>
          <Select>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Seleziona tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decision">Decisione</SelectItem>
              <SelectItem value="incident">Incidente</SelectItem>
              <SelectItem value="change">Cambiamento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Descrizione - Optional */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Descrizione
            </Label>
            <OptionalBadge />
          </div>
          <Textarea
            placeholder="Descrivi brevemente l'impatto..."
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Link - Optional */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Link correlato
            </Label>
            <OptionalBadge />
          </div>
          <Input
            placeholder="https://..."
            className="h-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" className="h-10">
          Annulla
        </Button>
        <Button className="h-10">
          Crea Impact
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function UIPreviewPage() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={cn("min-h-screen flex", darkMode && "dark")} style={{ backgroundColor: "var(--background)" }}>
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-14 border-b px-6 flex items-center justify-between sticky top-0 z-10" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>UI Preview</h1>
            <Badge variant="secondary" className="text-xs">Design System v1</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
              <Input
                placeholder="Search..."
                className="h-8 w-64 pl-9"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 space-y-12">

          {/* ================================================================
              DASHBOARD
              ================================================================ */}
          <section id="dashboard" className="scroll-mt-20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Dashboard</h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                La dashboard fornisce una panoramica immediata dello stato del tuo ISMS. Ogni metrica è cliccabile e ti permette di accedere ai dettagli specifici.
              </p>
            </div>

            {/* Dashboard Stats (Unified) */}
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Dashboard Stats</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>UnifiedGrid</code>
                  {" "}— Container unico con divisori interni
                </p>
              </div>
              <StatsGrid />
            </div>

            {/* Dashboard Stats (Card) */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Dashboard Stats (Card)</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>StatsCard</code>
                  {" "}— Card separate con gap
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Impact totali" value={12} icon={FileText} trend="+3 questo mese" />
                <StatsCard title="Azioni aperte" value={8} icon={AlertCircle} trend="Da completare" />
                <StatsCard title="Aree da valutare" value={15} icon={Clock} />
                <StatsCard title="Completati" value={4} icon={CheckCircle2} trend="Ultimo: 2 giorni fa" />
              </div>
            </div>
          </section>

          {/* ================================================================
              IMPACT
              ================================================================ */}
          <section id="impact" className="scroll-mt-20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Impact</h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Gestisci decisioni, incidenti e cambiamenti che impattano il tuo sistema di gestione della sicurezza delle informazioni.
              </p>
            </div>

            {/* Impact List (Unified) */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Impact List</h3>
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>UnifiedList</code>
                    {" "}<code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>UnifiedListRow</code>
                    {" "}— Container unificato con righe
                  </p>
                </div>
                <Button>
                  New Impact
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
              <ImpactList />
            </div>

            {/* Impact List (Card) */}
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Impact List (Card)</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>ListCard</code>
                  {" "}— Card separate con gap
                </p>
              </div>
              <ImpactListCards />
            </div>

            {/* Impact Areas (Unified) */}
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Impact Areas</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>UnifiedGrid</code>
                  {" "}— Container unico con divisori interni
                </p>
              </div>
              <ImpactAreasGrid />
            </div>

            {/* Impact Areas (Card) */}
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Impact Areas (Card)</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>ImpactAreaCard</code>
                  {" "}— Card separate con gap
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {impactAreas.map((area) => (
                  <ImpactAreaCard key={area.id} area={area} />
                ))}
              </div>
            </div>

            {/* Control Areas */}
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Control Areas</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>ControlAreaGrid</code>
                  {" "}— Griglia aree di controllo con stato
                </p>
              </div>
              <ControlAreaGrid />
            </div>

            {/* Impact Form */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Impact Form</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>ImpactForm</code>
                  {" "}— Form creazione nuovo impact
                </p>
              </div>
              <div className="max-w-lg border rounded-xl p-8" style={{ borderColor: "var(--border)" }}>
                <ImpactForm />
              </div>
            </div>
          </section>

          {/* ================================================================
              ACTION
              ================================================================ */}
          <section id="action" className="scroll-mt-20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Action</h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Gestisci le azioni correttive e preventive derivanti dalla valutazione degli impact.
              </p>
            </div>

            {/* Action List (Unified) */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Action List</h3>
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>UnifiedList</code>
                    {" "}<code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>UnifiedListRow</code>
                    {" "}— Container unificato con checkbox
                  </p>
                </div>
                <Button variant="outline">
                  <Plus className="w-3 h-3" />
                  Add Action
                </Button>
              </div>
              <ActionListUnified />
            </div>

            {/* Action List (Card) */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Action List (Card)</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>ListCard</code>
                  {" "}— Card separate con checkbox
                </p>
              </div>
              <ActionList />
            </div>
          </section>

          {/* ================================================================
              UI COMPONENTS
              ================================================================ */}
          <section id="ui-components" className="scroll-mt-20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>UI Components</h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Componenti primitivi riutilizzabili in tutta l&apos;applicazione.
              </p>
            </div>

            {/* Typography */}
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Typography</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Gerarchia tipografica e stili di testo
                </p>
              </div>

              {/* Headings showcase */}
              <div className="space-y-4 p-6 border rounded-lg" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Headings (h1-h4)</p>
                <div className="space-y-4">
                  <div className="flex items-baseline gap-4">
                    <h1>Heading 1</h1>
                    <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--text-tertiary)" }}>text-3xl font-bold tracking-tight</code>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <h2>Heading 2</h2>
                    <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--text-tertiary)" }}>text-2xl font-semibold tracking-tight</code>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <h3>Heading 3</h3>
                    <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--text-tertiary)" }}>text-xl font-semibold</code>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <h4>Heading 4</h4>
                    <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--text-tertiary)" }}>text-lg font-medium</code>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonna sinistra - Page content */}
                <div className="space-y-6">
                  {/* Page header example */}
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
                      Decision Trail Design System
                    </h1>
                    <p className="text-[16px] leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                      Questa pagina documenta tutti i componenti UI disponibili nel design system di Decision Trail. Il sistema è costruito su shadcn/ui con Tailwind CSS v4 e utilizza lo spazio colore OKLCH per una gestione accurata dei colori semantici.
                    </p>
                    <p className="text-[16px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      Ogni componente è progettato per supportare light e dark mode, con stati hover, focus e disabled consistenti in tutta l&apos;applicazione.
                    </p>
                  </div>

                  {/* Section with list */}
                  <div>
                    <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                      Principi del design system
                    </h2>
                    <ol className="list-decimal list-inside space-y-2 text-[15px]" style={{ color: "var(--text-secondary)" }}>
                      <li>Colori semantici con <strong style={{ color: "var(--text-primary)" }}>HUE consistenti</strong>: verde (145), giallo (95), rosso (25), viola (286).</li>
                      <li>Componenti <strong style={{ color: "var(--text-primary)" }}>accessibili</strong> con contrasti WCAG AA e stati focus visibili.</li>
                      <li>Pattern <strong style={{ color: "var(--text-primary)" }}>riutilizzabili</strong> per card, liste, form e feedback visivo.</li>
                    </ol>
                  </div>
                </div>

                {/* Colonna destra - Callouts */}
                <div className="space-y-4">
                  {/* Callout Caution */}
                  <div
                    className="border-l-4 rounded-r-lg p-4"
                    style={{
                      borderLeftColor: "var(--error)",
                      backgroundColor: "var(--error-soft)"
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" style={{ color: "var(--error)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--error-text)" }}>Caution</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                      Non modificare direttamente le variabili CSS in <strong>globals.css</strong> senza aggiornare anche i valori dark mode corrispondenti. I colori OKLCH richiedono coerenza tra light e dark theme.
                    </p>
                  </div>

                  {/* Callout Warning */}
                  <div
                    className="border-l-4 rounded-r-lg p-4"
                    style={{
                      borderLeftColor: "var(--warning)",
                      backgroundColor: "var(--warning-soft)"
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" style={{ color: "var(--warning)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--warning-text)" }}>Note</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                      I componenti shadcn/ui sono personalizzabili. Usa <strong>class-variance-authority</strong> per creare varianti aggiuntive mantenendo la consistenza con il design system.
                    </p>
                  </div>

                  {/* Callout Info */}
                  <div
                    className="border-l-4 rounded-r-lg p-4"
                    style={{
                      borderLeftColor: "var(--info)",
                      backgroundColor: "var(--info-soft)"
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4" style={{ color: "var(--info)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--info-text)" }}>Tip</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                      Usa la utility <strong>cn()</strong> da <code style={{ backgroundColor: "var(--muted)", padding: "0 4px", borderRadius: "3px" }}>@/lib/utils</code> per combinare classi Tailwind in modo condizionale e mantenere il codice pulito.
                    </p>
                  </div>

                  {/* Callout Success */}
                  <div
                    className="border-l-4 rounded-r-lg p-4"
                    style={{
                      borderLeftColor: "var(--success)",
                      backgroundColor: "var(--success-soft)"
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4" style={{ color: "var(--success)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--success-text)" }}>Success</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                      Il design system supporta nativamente light e dark mode. Tutti i componenti si adattano automaticamente alla preferenza dell&apos;utente.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Badges</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>SourceTypeBadge</code>
                  {" "}<code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>StatusBadge</code>
                  {" "}<code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>AreaStateBadge</code>
                  {" "}— Pill badges senza bordo
                </p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Source Types</p>
                  <div className="flex gap-2">
                    <SourceTypeBadge type="decision" />
                    <SourceTypeBadge type="incident" />
                    <SourceTypeBadge type="change" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Status</p>
                  <div className="flex gap-2">
                    <StatusBadge status="draft" />
                    <StatusBadge status="actions_open" />
                    <StatusBadge status="completed" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Area States</p>
                  <div className="flex gap-2">
                    <AreaStateBadge state="to_review" />
                    <AreaStateBadge state="impacted" />
                    <AreaStateBadge state="not_impacted" />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Buttons</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>Button</code>
                  {" "}— shadcn/ui button con gradient viola
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button>Dashboard</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button disabled>Disabled</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
                <Button>
                  <Plus className="w-4 h-4" />
                  With Icon
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Progress</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>Progress</code>
                  {" "}— Barra di progresso con varianti semantiche
                </p>
              </div>
              <div className="max-w-md space-y-6">
                {/* Progress con percentage badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Aree valutate</span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--info-soft)", color: "var(--info-text)" }}
                    >
                      71%
                    </span>
                  </div>
                  <Progress value={71} className="h-2" />
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>5 di 7 aree completate</p>
                </div>

                {/* Progress con stato warning */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Azioni completate</span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--warning-soft)", color: "var(--warning-text)" }}
                    >
                      30%
                    </span>
                  </div>
                  <div
                    className="relative h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "var(--warning-soft)" }}
                  >
                    <div
                      className="h-full transition-all rounded-full"
                      style={{ width: "30%", backgroundColor: "var(--warning)" }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>3 di 10 azioni completate</p>
                </div>

                {/* Progress completato (success) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Review completata</span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--success-soft)", color: "var(--success-text)" }}
                    >
                      100%
                    </span>
                  </div>
                  <div
                    className="relative h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "var(--success-soft)" }}
                  >
                    <div
                      className="h-full transition-all rounded-full"
                      style={{ width: "100%", backgroundColor: "var(--success)" }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Tutte le aree sono state valutate</p>
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Empty State</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>EmptyState</code>
                  {" "}— Stato vuoto con icona, titolo e CTA
                </p>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                  style={{ backgroundColor: "var(--info-soft)" }}
                >
                  <FileText className="w-6 h-6" style={{ color: "var(--info)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Nessun impact registrato
                </h3>
                <p className="text-sm mb-6 max-w-md" style={{ color: "var(--text-secondary)" }}>
                  Inizia a tracciare decisioni, incidenti e cambiamenti che impattano il tuo ISMS per mantenere la compliance ISO 27001.
                </p>
                <Button>
                  <Plus className="w-4 h-4" />
                  Crea il primo impact
                </Button>
              </div>
            </div>

            {/* Logo Variants */}
            <div className="space-y-4 mt-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Logo Variants</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Varianti dello scudo pulito con diversi stroke width
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {/* Variante 1: Stroke 2 (default Lucide) */}
                <div className="border rounded-lg p-6 text-center" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-center mb-4">
                    <Shield className="w-12 h-12 text-primary" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Stroke 2</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Default Lucide</p>
                </div>

                {/* Variante 2: Stroke 2.5 */}
                <div className="border rounded-lg p-6 text-center" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-center mb-4">
                    <Shield className="w-12 h-12 text-primary" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Stroke 2.5</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Leggermente più bold</p>
                </div>

                {/* Variante 3: Stroke 3 */}
                <div className="border rounded-lg p-6 text-center" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-center mb-4">
                    <Shield className="w-12 h-12 text-primary" strokeWidth={3} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Stroke 3</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Bold</p>
                </div>

                {/* Variante 4: Stroke 3.5 */}
                <div className="border rounded-lg p-6 text-center" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-center mb-4">
                    <Shield className="w-12 h-12 text-primary" strokeWidth={3.5} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Stroke 3.5</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Extra bold</p>
                </div>

                {/* Variante 5: Stroke 1.5 (più leggero) */}
                <div className="border rounded-lg p-6 text-center" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-center mb-4">
                    <Shield className="w-12 h-12 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Stroke 1.5</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Light</p>
                </div>
              </div>

              {/* Preview con testo */}
              <div className="mt-8 p-6 border rounded-lg" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                <p className="text-sm font-medium mb-4" style={{ color: "var(--text-secondary)" }}>Preview con nome app (24px)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Stroke 2 */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" strokeWidth={2} />
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Decision Trail</span>
                  </div>
                  {/* Stroke 2.5 */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" strokeWidth={2.5} />
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Decision Trail</span>
                  </div>
                  {/* Stroke 3 */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" strokeWidth={3} />
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Decision Trail</span>
                  </div>
                  {/* Stroke 3.5 */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" strokeWidth={3.5} />
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Decision Trail</span>
                  </div>
                  {/* Stroke 1.5 */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Decision Trail</span>
                  </div>
                </div>
              </div>

              {/* Preview a dimensioni diverse */}
              <div className="mt-4 p-6 border rounded-lg" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                <p className="text-sm font-medium mb-4" style={{ color: "var(--text-secondary)" }}>Confronto dimensioni (stroke 2.5)</p>
                <div className="flex items-end gap-8">
                  <div className="text-center">
                    <Shield className="w-6 h-6 text-primary mx-auto mb-2" strokeWidth={2.5} />
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>24px</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" strokeWidth={2.5} />
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>32px</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-10 h-10 text-primary mx-auto mb-2" strokeWidth={2.5} />
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>40px</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-2" strokeWidth={2.5} />
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>48px</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-16 h-16 text-primary mx-auto mb-2" strokeWidth={2.5} />
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>64px</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Controls */}
            <div className="space-y-4 mt-8">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Form Controls</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>Input</code>
                  {" "}<code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>Select</code>
                  {" "}<code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>Textarea</code>
                  {" "}<code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>Checkbox</code>
                  {" "}— Componenti form standalone
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input */}
                <div className="space-y-3">
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Input</p>
                  <div className="space-y-2">
                    <Label htmlFor="input-default">Default</Label>
                    <Input id="input-default" placeholder="Placeholder text" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-disabled">Disabled</Label>
                    <Input id="input-disabled" placeholder="Disabled input" disabled />
                  </div>
                </div>

                {/* Select */}
                <div className="space-y-3">
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Select</p>
                  <div className="space-y-2">
                    <Label>Default</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un'opzione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Opzione 1</SelectItem>
                        <SelectItem value="option2">Opzione 2</SelectItem>
                        <SelectItem value="option3">Opzione 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Disabled</Label>
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un'opzione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Opzione 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-3">
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Textarea</p>
                  <div className="space-y-2">
                    <Label htmlFor="textarea-default">Default</Label>
                    <Textarea id="textarea-default" placeholder="Inserisci una descrizione..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textarea-disabled">Disabled</Label>
                    <Textarea id="textarea-disabled" placeholder="Textarea disabilitata" disabled />
                  </div>
                </div>

                {/* Checkbox */}
                <div className="space-y-3">
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Checkbox</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox id="check-unchecked" />
                      <Label htmlFor="check-unchecked" className="font-normal">Unchecked</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox id="check-checked" defaultChecked />
                      <Label htmlFor="check-checked" className="font-normal">Checked</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox id="check-disabled" disabled />
                      <Label htmlFor="check-disabled" className="font-normal opacity-60">Disabled</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================
              NEW DECISION - AI INPUT VARIANTS
              ================================================================ */}
          <section id="new-decision" className="scroll-mt-20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>New Decision - AI Input</h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Varianti per l&apos;interfaccia di input AI. L&apos;obiettivo è creare uno &quot;spazio di pensiero&quot; moderno, non un form tradizionale.
              </p>
            </div>

            {/* Variante A: ChatGPT Style */}
            <div className="space-y-4 mb-12">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Variante A: ChatGPT Style</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Textarea con bordo, bottone integrato in basso a destra. Minimal, focus sul contenuto.
                </p>
              </div>
              <div className="border rounded-xl p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-full max-w-2xl">
                    {/* Greeting */}
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                        Cosa vuoi analizzare?
                      </h1>
                      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                        Descrivi una decisione, un cambiamento o un evento
                      </p>
                    </div>

                    {/* Input container */}
                    <div className="relative">
                      <Textarea
                        placeholder="Es. Stiamo valutando di passare da Slack a Microsoft Teams..."
                        className="min-h-[120px] pr-14 text-base resize-none rounded-xl"
                        style={{ paddingBottom: "3.5rem" }}
                      />
                      {/* Button inside */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <span className="text-xs tabular-nums" style={{ color: "var(--text-tertiary)" }}>0 / 5000</span>
                        <Button size="icon" className="rounded-lg h-9 w-9" disabled>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variante B: Claude Style */}
            <div className="space-y-4 mb-12">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Variante B: Claude Style</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Più ampio, con suggerimenti contestuali. Il bottone è esterno ma vicino.
                </p>
              </div>
              <div className="border rounded-xl p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-full max-w-3xl">
                    {/* Header minimal */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)", color: "white" }}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        Analisi AI
                      </span>
                    </div>

                    {/* Main input area */}
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Descrivi la decisione o il cambiamento che vuoi analizzare...

Alcuni esempi:
• Stiamo migrando il database da MySQL a PostgreSQL
• Abbiamo deciso di permettere il lavoro remoto permanente
• Un fornitore ha avuto un data breach"
                        className="min-h-[200px] text-base resize-none border-2 rounded-xl focus:border-primary/50 transition-colors"
                      />

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                            L&apos;AI ti aiuterà a identificare gli impatti ISMS
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs tabular-nums" style={{ color: "var(--text-tertiary)" }}>0 / 5000</span>
                          <Button className="gap-2" disabled>
                            <Sparkles className="w-4 h-4" />
                            Analizza
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variante C: Linear/Raycast Style */}
            <div className="space-y-4 mb-12">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Variante C: Linear/Raycast Style</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Command palette feel. Compatto, elegante, con shortcut hint.
                </p>
              </div>
              <div className="border rounded-xl p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-full max-w-xl">
                    {/* Card container */}
                    <div className="border rounded-2xl shadow-lg overflow-hidden" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                      {/* Header */}
                      <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                        <Sparkles className="w-5 h-5" style={{ color: "var(--primary)" }} />
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>Nuova Decisione</span>
                        <span className="ml-auto text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "var(--muted)", color: "var(--text-tertiary)" }}>
                          ⌘ Enter per inviare
                        </span>
                      </div>

                      {/* Input */}
                      <div className="p-4">
                        <Textarea
                          placeholder="Descrivi cosa è successo o cosa stai decidendo..."
                          className="min-h-[140px] text-base resize-none border-0 focus-visible:ring-0 p-0 shadow-none"
                        />
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          0 caratteri
                        </span>
                        <Button size="sm" className="gap-2" disabled>
                          Analizza con AI
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variante D: Notion AI Style */}
            <div className="space-y-4 mb-12">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Variante D: Notion AI Style</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Ultra minimal. Niente bordi visibili, focus totale sul testo. Floating action.
                </p>
              </div>
              <div className="border rounded-xl p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-full max-w-2xl">
                    {/* Floating label */}
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: "var(--muted)", color: "var(--text-secondary)" }}>
                        <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                        AI Analysis
                      </span>
                    </div>

                    {/* Clean textarea - no visible border */}
                    <div className="relative">
                      <Textarea
                        placeholder="Inizia a scrivere..."
                        className="min-h-[250px] text-lg resize-none border-0 focus-visible:ring-0 p-0 shadow-none placeholder:text-muted-foreground/50"
                        style={{ lineHeight: "1.75" }}
                      />
                    </div>

                    {/* Floating bottom bar */}
                    <div className="fixed-bottom mt-8 flex items-center justify-between py-4 border-t" style={{ borderColor: "var(--border)" }}>
                      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                        Premi <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "var(--muted)" }}>⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "var(--muted)" }}>↵</kbd> per analizzare
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs tabular-nums" style={{ color: "var(--text-tertiary)" }}>0 / 5000</span>
                        <Button variant="outline" size="sm" className="gap-2" disabled>
                          <Sparkles className="w-4 h-4" />
                          Analizza
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variante E: Perplexity Style */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Variante E: Perplexity Style</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Search bar prominente con suggerimenti rapidi sotto. Invita all&apos;azione.
                </p>
              </div>
              <div className="border rounded-xl p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-full max-w-2xl text-center">
                    {/* Big title */}
                    <h1 className="text-3xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Cosa vuoi analizzare?
                    </h1>
                    <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
                      Descrivi una decisione e l&apos;AI identificherà gli impatti
                    </p>

                    {/* Search-like input */}
                    <div className="relative mb-6">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Sparkles className="w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
                      </div>
                      <Input
                        placeholder="Es. Stiamo cambiando provider cloud..."
                        className="h-14 pl-12 pr-24 text-base rounded-2xl border-2"
                      />
                      <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl" disabled>
                        Analizza
                      </Button>
                    </div>

                    {/* Quick suggestions */}
                    <div className="flex flex-wrap justify-center gap-2">
                      <button className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:border-primary/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                        Cambio fornitore
                      </button>
                      <button className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:border-primary/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                        Nuova policy
                      </button>
                      <button className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:border-primary/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                        Incidente sicurezza
                      </button>
                      <button className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:border-primary/50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                        Nuovo strumento
                      </button>
                    </div>

                    {/* Expand hint */}
                    <p className="mt-6 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      Per descrizioni più lunghe, premi <kbd className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>Shift + Enter</kbd>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}
