# UI Style Guide - Decision Trail

Guida definitiva per creare un'interfaccia moderna, professionale e all'avanguardia. Ispirata ai migliori design system del 2025: Linear, Vercel, Raycast, Notion.

---

## Filosofia di design

### Principi fondamentali

| Principio | Descrizione |
|-----------|-------------|
| **Restraint over excess** | Meno elementi, più impatto. Ogni pixel deve guadagnarsi il suo posto |
| **Content-first** | L'UI scompare, il contenuto emerge. Niente decorazioni gratuite |
| **Perceived performance** | Skeleton loaders, transizioni fluide, feedback immediato |
| **Professional calm** | Colori neutri come base, accenti chirurgici per azioni importanti |

### Anti-pattern da evitare

- Colori primari saturi e "allegri" (il blu elettrico default di shadcn)
- Bordi spessi e visibili ovunque
- Ombre troppo marcate (drop-shadow-lg)
- Troppe varianti di grigio
- Card con padding eccessivo
- Icone colorate

---

## Sistema colori (OKLCH)

### Perché OKLCH

Linear ha rivoluzionato il loro sistema di temi usando OKLCH invece di HSL. Il motivo: **uniformità percettiva**. Un rosso e un giallo con la stessa lightness appaiono effettivamente ugualmente luminosi all'occhio umano.

```css
/* OKLCH: Lightness (0-1), Chroma (0-0.4), Hue (0-360) */
oklch(0.70 0.10 250)  /* Lightness 70%, Chroma bassa, Hue blu */
```

### Palette Decision Trail

#### Colore primario: Indigo desaturato

Abbandoniamo il blu elettrico. Il nostro primario è un **indigo freddo e sofisticato**, simile a Linear.

```css
:root {
  /* Primary - Indigo desaturato */
  --primary: oklch(0.55 0.15 270);           /* Base */
  --primary-hover: oklch(0.50 0.17 270);     /* Hover: più scuro, più saturo */
  --primary-active: oklch(0.45 0.18 270);    /* Active */
  --primary-foreground: oklch(0.98 0.01 270); /* Testo su primary */

  /* Variante soft per backgrounds */
  --primary-soft: oklch(0.95 0.03 270);      /* Light mode */
  --primary-soft-dark: oklch(0.25 0.05 270); /* Dark mode */
}
```

#### Scala neutri: Zinc (non Slate, non Gray)

Zinc offre un grigio leggermente freddo, perfetto per UI professionali. Non troppo caldo (stone), non troppo blu (slate).

```css
:root {
  /* Backgrounds */
  --background: oklch(0.99 0.00 0);          /* Quasi bianco */
  --background-subtle: oklch(0.97 0.00 0);   /* Aree secondarie */
  --background-muted: oklch(0.95 0.005 270); /* Leggerissimo tint */

  /* Superfici (card, modal, dropdown) */
  --surface: oklch(1.00 0.00 0);             /* Bianco puro */
  --surface-hover: oklch(0.97 0.005 270);    /* Hover state */
  --surface-active: oklch(0.95 0.008 270);   /* Active/selected */

  /* Bordi */
  --border: oklch(0.90 0.005 270);           /* Default */
  --border-subtle: oklch(0.94 0.003 270);    /* Divisori leggeri */
  --border-focus: oklch(0.55 0.15 270);      /* Focus ring = primary */

  /* Testo */
  --text-primary: oklch(0.15 0.01 270);      /* Titoli, contenuto principale */
  --text-secondary: oklch(0.45 0.01 270);    /* Descrizioni, metadata */
  --text-tertiary: oklch(0.60 0.008 270);    /* Placeholder, hint */
  --text-disabled: oklch(0.70 0.005 270);    /* Disabilitato */
}

.dark {
  /* Backgrounds */
  --background: oklch(0.13 0.01 270);        /* Quasi nero con tint */
  --background-subtle: oklch(0.16 0.01 270);
  --background-muted: oklch(0.18 0.015 270);

  /* Superfici */
  --surface: oklch(0.18 0.01 270);
  --surface-hover: oklch(0.22 0.015 270);
  --surface-active: oklch(0.25 0.02 270);

  /* Bordi */
  --border: oklch(0.25 0.015 270);
  --border-subtle: oklch(0.22 0.01 270);

  /* Testo */
  --text-primary: oklch(0.95 0.01 270);
  --text-secondary: oklch(0.70 0.01 270);
  --text-tertiary: oklch(0.55 0.01 270);
  --text-disabled: oklch(0.40 0.008 270);
}
```

#### Colori semantici

```css
:root {
  /* Success - Verde freddo */
  --success: oklch(0.60 0.18 155);
  --success-soft: oklch(0.95 0.04 155);
  --success-text: oklch(0.35 0.12 155);

  /* Warning - Ambra */
  --warning: oklch(0.75 0.18 85);
  --warning-soft: oklch(0.95 0.05 85);
  --warning-text: oklch(0.45 0.14 85);

  /* Error - Rosso freddo */
  --error: oklch(0.55 0.20 25);
  --error-soft: oklch(0.95 0.04 25);
  --error-text: oklch(0.45 0.18 25);

  /* Info - Blu */
  --info: oklch(0.60 0.15 250);
  --info-soft: oklch(0.95 0.03 250);
  --info-text: oklch(0.40 0.12 250);
}
```

#### Colori per stati Impact

Le 7 aree ISMS e i loro stati usano colori funzionali, non decorativi:

```css
:root {
  /* Stati area */
  --state-to-review: oklch(0.70 0.15 85);    /* Ambra - richiede attenzione */
  --state-impacted: oklch(0.55 0.18 25);     /* Rosso - critico */
  --state-not-impacted: oklch(0.60 0.15 155); /* Verde - ok */

  /* Background soft per badge/chip */
  --state-to-review-soft: oklch(0.95 0.04 85);
  --state-impacted-soft: oklch(0.95 0.03 25);
  --state-not-impacted-soft: oklch(0.95 0.03 155);
}
```

---

## Tipografia

### Font stack

**Geist** (Vercel) come primario - moderno, neutro, ottimizzato per UI. Fallback su Inter e system fonts.

```css
:root {
  --font-sans: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Installazione Geist

```bash
npm install geist
```

```typescript
// app/layout.tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export default function RootLayout({ children }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### Scala tipografica

Scala con ratio 1.25 (major third), ottimizzata per leggibilità.

| Nome | Size | Weight | Line Height | Uso |
|------|------|--------|-------------|-----|
| `text-xs` | 11px | 400 | 1.5 | Caption, metadata |
| `text-sm` | 13px | 400 | 1.5 | Descrizioni, secondary |
| `text-base` | 15px | 400 | 1.6 | Body text |
| `text-lg` | 17px | 500 | 1.5 | Emphasized body |
| `text-xl` | 20px | 600 | 1.4 | Card titles |
| `text-2xl` | 24px | 600 | 1.3 | Section headers |
| `text-3xl` | 30px | 700 | 1.2 | Page titles |

```css
/* Tailwind config */
fontSize: {
  'xs': ['0.6875rem', { lineHeight: '1.5' }],      /* 11px */
  'sm': ['0.8125rem', { lineHeight: '1.5' }],      /* 13px */
  'base': ['0.9375rem', { lineHeight: '1.6' }],    /* 15px */
  'lg': ['1.0625rem', { lineHeight: '1.5' }],      /* 17px */
  'xl': ['1.25rem', { lineHeight: '1.4' }],        /* 20px */
  '2xl': ['1.5rem', { lineHeight: '1.3' }],        /* 24px */
  '3xl': ['1.875rem', { lineHeight: '1.2' }],      /* 30px */
}
```

### Regole tipografiche

1. **Titles**: `font-semibold` o `font-bold`, mai regular
2. **Body**: `font-normal`, colore `text-secondary` per descrizioni
3. **Labels**: `text-sm font-medium`, uppercase MAI (tranne acronimi)
4. **Numbers/Data**: Font monospace per allineamento (`font-mono tabular-nums`)

```tsx
// Esempi
<h1 className="text-3xl font-bold text-primary">Page Title</h1>
<h2 className="text-xl font-semibold text-primary">Card Title</h2>
<p className="text-base text-secondary">Description text here</p>
<span className="text-xs text-tertiary">Last updated 2 hours ago</span>
<span className="font-mono tabular-nums text-sm">1,234</span>
```

---

## Spacing & Layout

### Sistema di spacing

Base 4px, scala geometrica. Mai usare valori arbitrari.

| Token | Value | Uso |
|-------|-------|-----|
| `space-0.5` | 2px | Micro-spacing (icon + text) |
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Default inline spacing |
| `space-3` | 12px | Compact padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Comfortable padding |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large gaps |
| `space-10` | 40px | Page sections |
| `space-12` | 48px | Major divisions |

### Padding delle card

**Meno è meglio.** Card compatte, non "puffy".

```tsx
// ❌ Troppo padding (default shadcn)
<Card className="p-6">

// ✅ Padding contenuto
<Card className="p-4">        {/* Card standard */}
<Card className="p-3">        {/* Card in lista */}
<Card className="px-4 py-3">  {/* Card orizzontale */}
```

### Gap tra elementi

```tsx
// Stack verticale
<div className="flex flex-col gap-1">   {/* Tight: label + input */}
<div className="flex flex-col gap-2">   {/* Normal: form fields */}
<div className="flex flex-col gap-4">   {/* Sections */}
<div className="flex flex-col gap-6">   {/* Major sections */}

// Inline
<div className="flex items-center gap-1.5">  {/* Icon + text */}
<div className="flex items-center gap-2">    {/* Chips, tags */}
<div className="flex items-center gap-3">    {/* Actions */}
```

---

## Border radius

**Subtle, non rounded-full.** Ispirato a Linear.

```css
:root {
  --radius-sm: 4px;    /* Inputs, small buttons */
  --radius-md: 6px;    /* Cards, dropdowns */
  --radius-lg: 8px;    /* Modals, large cards */
  --radius-xl: 12px;   /* Featured elements */
}
```

```tsx
// ❌ Troppo arrotondato
<Button className="rounded-full">
<Card className="rounded-2xl">

// ✅ Sottile ed elegante
<Button className="rounded-md">      {/* 6px */}
<Card className="rounded-lg">        {/* 8px */}
<Avatar className="rounded-full">    {/* Solo avatar */}
```

---

## Ombre

**Sottili e diffuse.** Mai ombre "cartoonose".

```css
:root {
  /* Ombra quasi invisibile per elevazione minima */
  --shadow-xs: 0 1px 2px oklch(0 0 0 / 0.04);

  /* Hover state, dropdown */
  --shadow-sm: 0 2px 8px oklch(0 0 0 / 0.06),
               0 1px 2px oklch(0 0 0 / 0.04);

  /* Card elevate, modal */
  --shadow-md: 0 4px 16px oklch(0 0 0 / 0.08),
               0 2px 4px oklch(0 0 0 / 0.04);

  /* Modal, overlay */
  --shadow-lg: 0 8px 32px oklch(0 0 0 / 0.12),
               0 4px 8px oklch(0 0 0 / 0.06);
}

.dark {
  /* In dark mode, ombre ancora più sottili */
  --shadow-xs: 0 1px 2px oklch(0 0 0 / 0.2);
  --shadow-sm: 0 2px 8px oklch(0 0 0 / 0.3);
  --shadow-md: 0 4px 16px oklch(0 0 0 / 0.4);
  --shadow-lg: 0 8px 32px oklch(0 0 0 / 0.5);
}
```

```tsx
// ❌ Ombre troppo marcate
<Card className="shadow-lg">
<div className="drop-shadow-2xl">

// ✅ Ombre sottili
<Card className="shadow-sm hover:shadow-md transition-shadow">
<Dropdown className="shadow-md">
```

---

## Bordi

**Quasi invisibili.** Il contenuto definisce le aree, non i bordi.

```tsx
// ❌ Bordi evidenti
<Card className="border-2 border-gray-300">
<Input className="border border-gray-400">

// ✅ Bordi sottili
<Card className="border border-border/50">       {/* Semi-trasparente */}
<Card className="border-0 bg-surface">           {/* Nessun bordo, solo bg */}
<Input className="border border-border focus:border-primary">
```

### Pattern: Separator vs Border

```tsx
// Per dividere sezioni, usa Separator non bordi
import { Separator } from "@/components/ui/separator"

<div>
  <SectionA />
  <Separator className="my-4" />
  <SectionB />
</div>
```

---

## Componenti

### Button

Tre varianti principali, stile contenuto.

```tsx
// Primary: azioni principali (1 per view)
<Button>
  Save changes
</Button>

// Secondary: azioni secondarie
<Button variant="secondary">
  Cancel
</Button>

// Ghost: azioni terziarie, navigation
<Button variant="ghost">
  <ArrowLeft className="w-4 h-4 mr-2" />
  Back
</Button>

// Destructive: azioni pericolose
<Button variant="destructive">
  Delete
</Button>
```

**Stile buttons:**

```css
.button-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  font-weight: 500;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  transition: background 150ms ease;
}

.button-primary:hover {
  background: var(--primary-hover);
}

.button-secondary {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.button-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.button-ghost:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}
```

### Card

Minimaliste, contenuto in primo piano.

```tsx
// Card base
<Card className="bg-surface border border-border/50 rounded-lg p-4">
  <CardHeader className="p-0 pb-3">
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
    <CardDescription className="text-sm text-secondary">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent className="p-0">
    {/* Content */}
  </CardContent>
</Card>

// Card interattiva (lista items)
<Card className="bg-surface border border-border/50 rounded-lg p-3
                 hover:bg-surface-hover hover:border-border
                 cursor-pointer transition-colors">
  {/* Content */}
</Card>

// Card selezionata
<Card className={cn(
  "bg-surface border rounded-lg p-3 cursor-pointer transition-all",
  isSelected
    ? "border-primary bg-primary-soft ring-1 ring-primary/20"
    : "border-border/50 hover:bg-surface-hover"
)}>
  {/* Content */}
</Card>
```

### Input

Clean e funzionali.

```tsx
<div className="space-y-1.5">
  <Label className="text-sm font-medium text-secondary">
    Email
  </Label>
  <Input
    placeholder="you@example.com"
    className="h-9 bg-surface border-border
               focus:border-primary focus:ring-1 focus:ring-primary/20
               placeholder:text-tertiary"
  />
  <p className="text-xs text-tertiary">
    We'll never share your email.
  </p>
</div>
```

### Badge / Chip

Per stati e categorizzazione.

```tsx
// Stato area ISMS
<Badge variant="outline" className={cn(
  "text-xs font-medium border-0",
  state === 'to_review' && "bg-state-to-review-soft text-warning-text",
  state === 'impacted' && "bg-state-impacted-soft text-error-text",
  state === 'not_impacted' && "bg-state-not-impacted-soft text-success-text",
)}>
  {state === 'to_review' && 'Da valutare'}
  {state === 'impacted' && 'Impattato'}
  {state === 'not_impacted' && 'Non impattato'}
</Badge>

// Source type
<Badge variant="secondary" className="text-xs font-normal bg-muted text-secondary">
  <Circle className="w-2 h-2 mr-1.5 fill-current" />
  {sourceType}
</Badge>
```

### Data table

Densità alta, informazioni scannable.

```tsx
<Table>
  <TableHeader>
    <TableRow className="border-border/50 hover:bg-transparent">
      <TableHead className="text-xs font-medium text-tertiary uppercase tracking-wide h-8">
        Impact
      </TableHead>
      <TableHead className="text-xs font-medium text-tertiary uppercase tracking-wide h-8">
        Status
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-border/50 hover:bg-surface-hover cursor-pointer">
      <TableCell className="py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-primary">Impact title</span>
          <span className="text-xs text-tertiary">2 hours ago</span>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Badge>...</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Microinteractions

### Transizioni

Veloci e sottili. 150ms è il sweet spot.

```css
:root {
  --transition-fast: 100ms ease;
  --transition-base: 150ms ease;
  --transition-slow: 250ms ease;
}
```

```tsx
// Hover states
className="transition-colors duration-150"
className="transition-all duration-150"

// Animazioni più complesse (modal, dropdown)
className="transition-all duration-200"
```

### Hover effects

Cambiamenti sottili di background, non colore.

```tsx
// ❌ Hover troppo aggressivo
className="hover:bg-blue-500 hover:text-white"

// ✅ Hover sottile
className="hover:bg-surface-hover"
className="hover:bg-muted/50"
```

### Focus states

Ring visibile per accessibilità, ma elegante.

```tsx
className="focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
className="focus-visible:ring-2 focus-visible:ring-primary/20"
```

### Loading states

Skeleton invece di spinner quando possibile.

```tsx
// Skeleton per contenuto
<Skeleton className="h-4 w-32 rounded bg-muted animate-pulse" />

// Spinner solo per azioni
<Button disabled>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Saving...
</Button>
```

---

## Iconografia

### Libreria: Lucide

Lucide (fork di Feather) - linee sottili, consistenti, open source.

```bash
npm install lucide-react
```

### Regole

1. **Dimensione consistente**: `w-4 h-4` per inline, `w-5 h-5` per standalone
2. **Stroke width**: Default (1.5-2), mai bold
3. **Colore**: Inherit dal testo, mai colori custom

```tsx
// ✅ Corretto
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Add impact
</Button>

<span className="text-tertiary">
  <Calendar className="w-4 h-4" />
</span>

// ❌ Evitare
<Plus className="w-6 h-6 text-blue-500" />  // Troppo grande, colorato
```

### Icone comuni Decision Trail

```tsx
import {
  // Navigation
  Home, Settings, Users, LogOut,
  // Actions
  Plus, Pencil, Trash2, Archive, Download,
  // Status
  Circle, CheckCircle2, AlertCircle, Clock,
  // UI
  ChevronDown, ChevronRight, X, Search, Filter,
  // Domain
  Shield, FileText, Link2, Calendar
} from 'lucide-react'
```

---

## Layout patterns

### Sidebar + Content

Layout principale dell'app.

```tsx
<div className="flex h-screen bg-background">
  {/* Sidebar */}
  <aside className="w-60 border-r border-border/50 bg-surface flex flex-col">
    <div className="p-4 border-b border-border/50">
      {/* Logo/Workspace selector */}
    </div>
    <nav className="flex-1 p-2">
      {/* Navigation items */}
    </nav>
    <div className="p-3 border-t border-border/50">
      {/* User menu */}
    </div>
  </aside>

  {/* Main content */}
  <main className="flex-1 flex flex-col overflow-hidden">
    {/* Header */}
    <header className="h-14 border-b border-border/50 px-6 flex items-center">
      {/* Page title, actions */}
    </header>

    {/* Content */}
    <div className="flex-1 overflow-auto p-6">
      {children}
    </div>
  </main>
</div>
```

### Page header

```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-semibold text-primary">Impacts</h1>
    <p className="text-sm text-secondary mt-1">
      Track and evaluate ISMS impacts
    </p>
  </div>
  <Button>
    <Plus className="w-4 h-4 mr-2" />
    New impact
  </Button>
</div>
```

### Empty state

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
    <FileText className="w-6 h-6 text-tertiary" />
  </div>
  <h3 className="text-lg font-medium text-primary mb-1">No impacts yet</h3>
  <p className="text-sm text-secondary mb-4 max-w-sm">
    Start tracking decisions, incidents, and changes that affect your ISMS.
  </p>
  <Button>
    <Plus className="w-4 h-4 mr-2" />
    Create first impact
  </Button>
</div>
```

---

## Responsive design

### Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Pattern: Sidebar collapse

```tsx
// Mobile: sidebar come sheet
// Desktop: sidebar fissa

<Sheet>
  <SheetTrigger asChild className="lg:hidden">
    <Button variant="ghost" size="icon">
      <Menu className="w-5 h-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-60 p-0">
    <Sidebar />
  </SheetContent>
</Sheet>

<aside className="hidden lg:flex w-60 ...">
  <Sidebar />
</aside>
```

---

## Dark mode

### Implementazione

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

### Toggle

```tsx
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="w-4 h-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

---

## Checklist pre-implementazione

Prima di scrivere un componente, verifica:

- [ ] **Colori**: Usa solo variabili CSS, mai valori hardcoded
- [ ] **Padding**: 4px base, preferisci `p-3` o `p-4`, mai `p-6` di default
- [ ] **Border radius**: `rounded-md` (6px) o `rounded-lg` (8px)
- [ ] **Bordi**: `border-border/50` o nessun bordo
- [ ] **Ombre**: `shadow-sm` o `shadow-md`, mai `shadow-lg` di default
- [ ] **Font weight**: `font-medium` per labels, `font-semibold` per titoli
- [ ] **Transitions**: `transition-colors duration-150`
- [ ] **Focus**: `focus:ring-2 focus:ring-primary/20`
- [ ] **Dark mode**: Tutte le variabili hanno versione dark

---

## File di configurazione

### globals.css

Copia questo file in `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* === PRIMARY === */
    --primary: oklch(0.55 0.15 270);
    --primary-hover: oklch(0.50 0.17 270);
    --primary-active: oklch(0.45 0.18 270);
    --primary-foreground: oklch(0.98 0.01 270);
    --primary-soft: oklch(0.95 0.03 270);

    /* === BACKGROUNDS === */
    --background: oklch(0.99 0.00 0);
    --background-subtle: oklch(0.97 0.00 0);
    --background-muted: oklch(0.95 0.005 270);

    /* === SURFACES === */
    --surface: oklch(1.00 0.00 0);
    --surface-hover: oklch(0.97 0.005 270);
    --surface-active: oklch(0.95 0.008 270);

    /* === BORDERS === */
    --border: oklch(0.90 0.005 270);
    --border-subtle: oklch(0.94 0.003 270);

    /* === TEXT === */
    --foreground: oklch(0.15 0.01 270);
    --text-primary: oklch(0.15 0.01 270);
    --text-secondary: oklch(0.45 0.01 270);
    --text-tertiary: oklch(0.60 0.008 270);
    --text-disabled: oklch(0.70 0.005 270);

    /* === SEMANTIC === */
    --success: oklch(0.60 0.18 155);
    --success-soft: oklch(0.95 0.04 155);
    --success-text: oklch(0.35 0.12 155);

    --warning: oklch(0.70 0.15 85);
    --warning-soft: oklch(0.95 0.05 85);
    --warning-text: oklch(0.45 0.14 85);

    --destructive: oklch(0.55 0.20 25);
    --destructive-soft: oklch(0.95 0.04 25);
    --destructive-text: oklch(0.45 0.18 25);

    --info: oklch(0.60 0.15 250);
    --info-soft: oklch(0.95 0.03 250);
    --info-text: oklch(0.40 0.12 250);

    /* === IMPACT STATES === */
    --state-to-review: oklch(0.70 0.15 85);
    --state-to-review-soft: oklch(0.95 0.04 85);
    --state-impacted: oklch(0.55 0.18 25);
    --state-impacted-soft: oklch(0.95 0.03 25);
    --state-not-impacted: oklch(0.60 0.15 155);
    --state-not-impacted-soft: oklch(0.95 0.03 155);

    /* === SHADCN COMPAT === */
    --card: var(--surface);
    --card-foreground: var(--foreground);
    --popover: var(--surface);
    --popover-foreground: var(--foreground);
    --secondary: var(--background-muted);
    --secondary-foreground: var(--text-primary);
    --muted: var(--background-muted);
    --muted-foreground: var(--text-secondary);
    --accent: var(--surface-hover);
    --accent-foreground: var(--text-primary);
    --ring: var(--primary);
    --input: var(--border);

    /* === RADIUS === */
    --radius: 0.375rem;
  }

  .dark {
    /* === PRIMARY (same hue, adjusted lightness) === */
    --primary: oklch(0.65 0.15 270);
    --primary-hover: oklch(0.70 0.17 270);
    --primary-active: oklch(0.75 0.18 270);
    --primary-foreground: oklch(0.15 0.01 270);
    --primary-soft: oklch(0.25 0.05 270);

    /* === BACKGROUNDS === */
    --background: oklch(0.13 0.01 270);
    --background-subtle: oklch(0.16 0.01 270);
    --background-muted: oklch(0.18 0.015 270);

    /* === SURFACES === */
    --surface: oklch(0.18 0.01 270);
    --surface-hover: oklch(0.22 0.015 270);
    --surface-active: oklch(0.25 0.02 270);

    /* === BORDERS === */
    --border: oklch(0.28 0.015 270);
    --border-subtle: oklch(0.22 0.01 270);

    /* === TEXT === */
    --foreground: oklch(0.95 0.01 270);
    --text-primary: oklch(0.95 0.01 270);
    --text-secondary: oklch(0.70 0.01 270);
    --text-tertiary: oklch(0.55 0.01 270);
    --text-disabled: oklch(0.40 0.008 270);

    /* === SEMANTIC (adjusted for dark) === */
    --success: oklch(0.65 0.16 155);
    --success-soft: oklch(0.25 0.06 155);
    --success-text: oklch(0.75 0.14 155);

    --warning: oklch(0.75 0.15 85);
    --warning-soft: oklch(0.25 0.06 85);
    --warning-text: oklch(0.85 0.12 85);

    --destructive: oklch(0.60 0.18 25);
    --destructive-soft: oklch(0.25 0.06 25);
    --destructive-text: oklch(0.80 0.15 25);

    /* === IMPACT STATES (dark) === */
    --state-to-review-soft: oklch(0.25 0.05 85);
    --state-impacted-soft: oklch(0.25 0.05 25);
    --state-not-impacted-soft: oklch(0.25 0.05 155);

    /* === SHADCN COMPAT === */
    --card: var(--surface);
    --card-foreground: var(--foreground);
    --popover: var(--surface);
    --popover-foreground: var(--foreground);
    --secondary: var(--background-muted);
    --secondary-foreground: var(--text-primary);
    --muted: var(--background-muted);
    --muted-foreground: var(--text-secondary);
    --accent: var(--surface-hover);
    --accent-foreground: var(--text-primary);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-text)",
          soft: "var(--destructive-soft)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
          text: "var(--success-text)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
          text: "var(--warning-text)",
        },
        info: {
          DEFAULT: "var(--info)",
          soft: "var(--info-soft)",
          text: "var(--info-text)",
        },
        state: {
          "to-review": "var(--state-to-review)",
          "to-review-soft": "var(--state-to-review-soft)",
          "impacted": "var(--state-impacted)",
          "impacted-soft": "var(--state-impacted-soft)",
          "not-impacted": "var(--state-not-impacted)",
          "not-impacted-soft": "var(--state-not-impacted-soft)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        xs: ["0.6875rem", { lineHeight: "1.5" }],
        sm: ["0.8125rem", { lineHeight: "1.5" }],
        base: ["0.9375rem", { lineHeight: "1.6" }],
        lg: ["1.0625rem", { lineHeight: "1.5" }],
        xl: ["1.25rem", { lineHeight: "1.4" }],
        "2xl": ["1.5rem", { lineHeight: "1.3" }],
        "3xl": ["1.875rem", { lineHeight: "1.2" }],
      },
      boxShadow: {
        xs: "0 1px 2px oklch(0 0 0 / 0.04)",
        sm: "0 2px 8px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.04)",
        md: "0 4px 16px oklch(0 0 0 / 0.08), 0 2px 4px oklch(0 0 0 / 0.04)",
        lg: "0 8px 32px oklch(0 0 0 / 0.12), 0 4px 8px oklch(0 0 0 / 0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

---

## Schermate Decision Trail

### Dashboard

```tsx
// src/app/(authenticated)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your workspace activity
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Open impacts"
          value={12}
          trend="+3 this week"
          icon={<AlertCircle className="w-4 h-4" />}
        />
        <StatCard
          label="Areas to review"
          value={8}
          trend="4 critical"
          variant="warning"
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          label="Actions pending"
          value={24}
          trend="6 due soon"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
      </div>

      {/* Recent impacts */}
      <div>
        <h2 className="text-lg font-medium mb-3">Recent impacts</h2>
        <div className="space-y-2">
          {impacts.map(impact => (
            <ImpactRow key={impact.id} impact={impact} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, trend, variant, icon }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="mt-2">
        <span className="text-3xl font-semibold font-mono tabular-nums">
          {value}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{trend}</p>
    </Card>
  )
}
```

### Impact List

```tsx
// src/app/(authenticated)/impacts/page.tsx
export default function ImpactsPage() {
  return (
    <div className="space-y-6">
      {/* Page header with action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Impacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and evaluate ISMS impacts
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New impact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search impacts..." className="pl-9" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Filter options */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Impact list */}
      <div className="space-y-2">
        {impacts.map(impact => (
          <ImpactCard key={impact.id} impact={impact} />
        ))}
      </div>
    </div>
  )
}

function ImpactCard({ impact }) {
  return (
    <Card className="p-4 hover:bg-surface-hover transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{impact.title}</h3>
            <SourceTypeBadge type={impact.source_type} />
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {impact.description}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(impact.updated_at)}
            </span>
            <span>{impact.created_by_name}</span>
          </div>
        </div>

        {/* Area summary pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {impact.areas_impacted > 0 && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-state-impacted-soft text-destructive">
              {impact.areas_impacted}
            </span>
          )}
          {impact.areas_to_review > 0 && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-state-to-review-soft text-warning-text">
              {impact.areas_to_review}
            </span>
          )}
          {impact.areas_not_impacted > 0 && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-state-not-impacted-soft text-success-text">
              {impact.areas_not_impacted}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
```

### Impact Detail - Area Grid

Il componente più importante dell'app: la griglia delle 7 aree ISMS.

```tsx
// src/components/impact/area-grid.tsx
const AREAS = [
  { key: 'asset_tools', label: 'Asset & Tools', icon: Server },
  { key: 'information_data', label: 'Information & Data', icon: Database },
  { key: 'access_privileges', label: 'Access & Privileges', icon: Key },
  { key: 'process_controls', label: 'Process & Controls', icon: GitBranch },
  { key: 'risk_impact', label: 'Risk & Impact', icon: AlertTriangle },
  { key: 'policies_docs', label: 'Policies & Docs', icon: FileText },
  { key: 'people_awareness', label: 'People & Awareness', icon: Users },
]

interface AreaGridProps {
  states: AreaState[]
  onStateChange: (areaKey: string, newState: string, notes?: string) => void
  readOnly?: boolean
}

export function AreaGrid({ states, onStateChange, readOnly }: AreaGridProps) {
  const stateMap = Object.fromEntries(states.map(s => [s.area_key, s]))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {AREAS.map(area => {
        const state = stateMap[area.key]
        return (
          <AreaCard
            key={area.key}
            area={area}
            state={state}
            onStateChange={onStateChange}
            readOnly={readOnly}
          />
        )
      })}
    </div>
  )
}

function AreaCard({ area, state, onStateChange, readOnly }) {
  const Icon = area.icon
  const currentState = state?.state || 'to_review'

  return (
    <Card className={cn(
      "p-3 transition-all",
      currentState === 'impacted' && "border-destructive/30 bg-destructive-soft/30",
      currentState === 'not_impacted' && "border-success/30 bg-success-soft/30",
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center",
          currentState === 'to_review' && "bg-muted text-muted-foreground",
          currentState === 'impacted' && "bg-destructive/10 text-destructive",
          currentState === 'not_impacted' && "bg-success/10 text-success",
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm">{area.label}</span>
      </div>

      {/* State selector */}
      {!readOnly && (
        <div className="flex gap-1 mb-3">
          <StateButton
            active={currentState === 'to_review'}
            onClick={() => onStateChange(area.key, 'to_review')}
            variant="warning"
          >
            <Clock className="w-3 h-3" />
          </StateButton>
          <StateButton
            active={currentState === 'impacted'}
            onClick={() => onStateChange(area.key, 'impacted')}
            variant="destructive"
          >
            <AlertCircle className="w-3 h-3" />
          </StateButton>
          <StateButton
            active={currentState === 'not_impacted'}
            onClick={() => onStateChange(area.key, 'not_impacted')}
            variant="success"
          >
            <CheckCircle2 className="w-3 h-3" />
          </StateButton>
        </div>
      )}

      {/* Notes preview */}
      {state?.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {state.notes}
        </p>
      )}
    </Card>
  )
}

function StateButton({ active, onClick, variant, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 h-8 rounded-md flex items-center justify-center transition-all",
        "hover:opacity-80",
        active && variant === 'warning' && "bg-warning text-warning-foreground",
        active && variant === 'destructive' && "bg-destructive text-white",
        active && variant === 'success' && "bg-success text-white",
        !active && "bg-muted text-muted-foreground hover:bg-muted/80",
      )}
    >
      {children}
    </button>
  )
}
```

### Impact Detail Page

```tsx
// src/app/(authenticated)/impacts/[id]/page.tsx
export default function ImpactDetailPage({ params }) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/impacts" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">Impacts</span>
        <span className="text-muted-foreground">/</span>
        <span className="truncate max-w-[200px]">{impact.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{impact.title}</h1>
            <SourceTypeBadge type={impact.source_type} />
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {impact.description}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span>Created by {impact.created_by_name}</span>
            <span>·</span>
            <span>{formatDate(impact.created_at)}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Area Grid */}
      <div>
        <h2 className="text-lg font-medium mb-3">ISMS Areas</h2>
        <AreaGrid
          states={areaStates}
          onStateChange={handleStateChange}
        />
      </div>

      {/* Actions section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Actions</h2>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add action
          </Button>
        </div>
        <ActionsList actions={actions} />
      </div>

      {/* References section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">References</h2>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add link
          </Button>
        </div>
        <ReferencesList references={references} />
      </div>
    </div>
  )
}
```

### Sidebar Navigation

```tsx
// src/components/layout/sidebar.tsx
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/impacts', label: 'Impacts', icon: Shield },
  { href: '/actions', label: 'Actions', icon: CheckCircle2 },
]

const WORKSPACE_ITEMS = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/members', label: 'Members', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 border-r border-border/50 bg-surface flex flex-col h-screen">
      {/* Workspace selector */}
      <div className="p-3 border-b border-border/50">
        <WorkspaceSelector />
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}

        <Separator className="my-3" />

        {WORKSPACE_ITEMS.map(item => (
          <NavItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
        ))}
      </nav>

      {/* User menu */}
      <div className="p-2 border-t border-border/50">
        <UserMenu />
      </div>
    </aside>
  )
}

function NavItem({ item, active }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-primary-soft text-primary font-medium"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {item.label}
    </Link>
  )
}

function WorkspaceSelector() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-surface-hover transition-colors">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">A</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium truncate">Acme Corp</p>
            <p className="text-xs text-muted-foreground">5 members</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {/* Workspace list */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Componenti riutilizzabili

### SourceTypeBadge

```tsx
// src/components/impact/source-type-badge.tsx
const SOURCE_TYPES = {
  decision: { label: 'Decision', color: 'info' },
  incident: { label: 'Incident', color: 'destructive' },
  audit: { label: 'Audit', color: 'warning' },
  requirement: { label: 'Requirement', color: 'info' },
  organizational: { label: 'Organizational', color: 'default' },
  technical: { label: 'Technical', color: 'default' },
  near_miss: { label: 'Near Miss', color: 'warning' },
}

export function SourceTypeBadge({ type }: { type: string }) {
  const config = SOURCE_TYPES[type] || { label: type, color: 'default' }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-xs font-normal",
        config.color === 'destructive' && "bg-destructive-soft text-destructive-text",
        config.color === 'warning' && "bg-warning-soft text-warning-text",
        config.color === 'info' && "bg-info-soft text-info-text",
        config.color === 'default' && "bg-muted text-muted-foreground",
      )}
    >
      {config.label}
    </Badge>
  )
}
```

### ActionsList

```tsx
// src/components/impact/actions-list.tsx
export function ActionsList({ actions }) {
  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No actions yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {actions.map(action => (
        <div
          key={action.id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border border-border/50",
            action.status === 'done' && "opacity-60"
          )}
        >
          <Checkbox
            checked={action.status === 'done'}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm",
              action.status === 'done' && "line-through text-muted-foreground"
            )}>
              {action.description}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {action.owner && <span>{action.owner_name}</span>}
              {action.due_date && (
                <span className={cn(
                  isPastDue(action.due_date) && action.status !== 'done' && "text-destructive"
                )}>
                  Due {formatDate(action.due_date)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Risorse

| Risorsa | Link |
|---------|------|
| Linear Design | [linear.app/brand](https://linear.app/brand) |
| shadcn/ui Themes | [ui.shadcn.com/themes](https://ui.shadcn.com/themes) |
| 10000+ shadcn themes | [ui.jln.dev](https://ui.jln.dev/) |
| tweakcn Theme Editor | [tweakcn.com](https://tweakcn.com/) |
| Geist Font | [vercel.com/font](https://vercel.com/font) |
| Lucide Icons | [lucide.dev](https://lucide.dev/) |
| OKLCH Color Picker | [oklch.com](https://oklch.com/) |
| Evil Martians Harmonizer | [evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools](https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools) |
