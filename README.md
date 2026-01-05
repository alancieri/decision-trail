# Decision Trail

> **Make impact visible before it becomes a problem.**

Decision Trail e un tool per tracciare e valutare l'impatto ISMS di decisioni, incidenti e cambiamenti organizzativi.

---

## Stack tecnologico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Postgres + Auth)
- **i18n**: next-intl (IT/EN)

---

## Setup locale

### Prerequisiti

- Node.js 18+
- Account Supabase (free tier ok)

### 1. Clone e installa dipendenze

```bash
git clone <repo-url>
cd decision-trail
npm install
```

### 2. Configura variabili ambiente

Copia il file esempio e configura:

```bash
cp .env.local.example .env.local
```

Valori richiesti:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Per inviti (server-side only)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup database Supabase

Esegui lo schema SQL in Supabase SQL Editor:

```bash
# Il file e in: supabase/schema.sql
```

### 4. Avvia il server di sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

---

## Struttura progetto

```
decision-trail/
├── docs/                    # Documentazione tecnica
│   ├── product-spec.md      # Specifiche prodotto MVP
│   └── auth-architecture.md # Architettura Auth & Workspace
├── supabase/
│   └── schema.sql            # Schema DB completo
├── src/
│   ├── app/
│   │   ├── (authenticated)/     # Layout con auth check
│   │   │   ├── dashboard/
│   │   │   ├── impacts/
│   │   │   └── workspaces/
│   │   ├── api/
│   │   │   └── invitations/     # API per inviti
│   │   └── auth/
│   │       ├── callback/        # OAuth callback
│   │       └── login/           # Login page
│   ├── components/
│   │   ├── app-shell.tsx        # Layout principale + workspace context
│   │   └── ui/                  # shadcn components
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts        # Browser client
│   │       ├── server.ts        # Server client
│   │       └── middleware.ts    # Session refresh
│   ├── types/
│   │   └── database.ts          # Tipi generati da Supabase
│   └── messages/
│       ├── it.json              # Traduzioni IT
│       └── en.json              # Traduzioni EN
└── README.md
```

---

## Comandi utili

```bash
# Sviluppo
npm run dev

# Build produzione
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## Documentazione

| Documento | Descrizione |
|-----------|-------------|
| [Product Spec](./docs/product-spec.md) | Specifiche prodotto MVP complete |
| [Auth Architecture](./docs/auth-architecture.md) | Architettura Auth, Workspace, RLS, Trigger |
| [Database Guide](./docs/database-guide.md) | Guida pratica al database per sviluppatori frontend |
| [UI Style Guide](./docs/ui-style-guide.md) | Design system, colori OKLCH, tipografia, componenti |
| [Supabase Docs](https://supabase.com/docs) | Documentazione Supabase |
| [Next.js Docs](https://nextjs.org/docs) | Documentazione Next.js |
