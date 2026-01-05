# Decision Trail – Technical Product Spec (MVP v1)

> **Documento tecnico di riferimento** per l'implementazione dell'MVP.
> Lingua: IT • Formato: Markdown
>
> **Product name**: Decision Trail
> **Tagline**: *Make impact visible before it becomes a problem.*

---

## 1. Purpose & Non-goals

### 1.1 Purpose
Costruire un **prodotto minimale** che permetta a CTO e ISMS Manager di:
- intercettare **qualsiasi evento, decisione o cambiamento** che possa avere impatto sull’ISMS;
- **valutarne l’impatto in modo strutturato**;
- **non dimenticare** azioni e aggiornamenti necessari;
- mantenere una **memoria auditabile** delle valutazioni svolte nel tempo.

Il prodotto **non gestisce l’ISMS**, ma rende **difendibile e tracciabile** il modo in cui l’organizzazione pensa l’impatto ISMS.

### 1.2 Non-goals (fuori scope esplicito)
L’MVP **NON** deve includere:
- gestione completa ISMS;
- risk engine o valutazioni quantitative;
- SoA editor;
- gestione documentale / upload file;
- workflow approvativi complessi;
- scoring, KPI o dashboard avanzate;
- automazioni decisionali o AI che “decide”.

---

## 2. Core Concept: Impact

### 2.1 Definizione
Un **Impact** rappresenta una situazione (decisione pianificata, evento operativo, audit, cambiamento organizzativo o tecnico) che **richiede una valutazione di impatto sull’ISMS**.

### 2.2 Cosa NON è un Impact
- Non è un incidente (anche se può derivare da un incidente).
- Non è una decisione tecnica pura.
- Non è un risk assessment.

### 2.3 Perché Impact è l’oggetto centrale
- Tutti i casi reali convergono qui (adozione tool, deploy difettoso, audit, near miss).
- L’Impact è **agnostico rispetto a ISO** ma **difendibile in audit**.
- È l’unico modo per rendere persistente il ragionamento ISMS.

---

## 3. User Journey MVP

### 3.1 Create Impact
Azione iniziale dell’utente:
- titolo (obbligatorio);
- descrizione breve (opzionale);
- data (default oggi);
- creato da (automatico).

Stato iniziale: `draft`.

### 3.2 Impact List (Home)
Vista principale:
- elenco degli Impact;
- stato globale;
- numero di aree da valutare;
- numero di azioni aperte.

Serve come **memoria centrale** e vista da audit.

### 3.3 Impact View (schermata unica)
Contiene:
- informazioni base dell’Impact;
- **7 aree ISMS**, tutte visibili;
- stato per area;
- note e azioni;
- vincoli di chiusura.

---

## 4. ISMS Areas (IP del prodotto)

Aree invarianti, non configurabili dall’utente in v1:

1. **Asset & strumenti**
2. **Informazioni & dati**
3. **Accessi & privilegi**
4. **Processi & controlli operativi**
5. **Rischio & impatto**
6. **Policy, procedure & documentazione**
7. **Persone & consapevolezza**

Ogni area deve essere valutata esplicitamente.

---

## 5. Data Model (definitivo)

### 5.1 workspace
```sql
workspace (
  id uuid pk,
  name text not null,
  created_by uuid fk references auth.users(id),
  created_at timestamp
)
```

> **Nota**: `created_by` traccia chi ha creato il workspace (sempre un owner).

### 5.2 profiles
```sql
profiles (
  id uuid pk references auth.users(id),
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp,
  updated_at timestamp
)
```

> **Nota**: Tabella rinominata da `app_user` a `profiles` per seguire la convenzione Supabase. La relazione utente-workspace è gestita da `workspace_member`.

### 5.2b workspace_member
```sql
workspace_member (
  id uuid pk,
  workspace_id uuid fk,
  user_id uuid fk references auth.users(id),
  role text check (role in ('owner', 'member')),
  created_at timestamp,
  unique (workspace_id, user_id)
)
```

> **Decisione**: Il modello dati supporta multi-workspace e **la UX v1 include il workspace switcher** per supportare il caso d'uso consulente (un utente gestisce più clienti, ognuno in un workspace separato).

### 5.2c workspace_invitation
```sql
workspace_invitation (
  id uuid pk,
  workspace_id uuid fk,
  email text not null,
  role text check (role in ('owner', 'member')),
  invited_by uuid fk references auth.users(id),
  status text check (status in ('pending', 'accepted', 'expired')),
  created_at timestamp,
  expires_at timestamp,
  accepted_at timestamp,
  unique (workspace_id, email)
)
```

> **Nota**: Tabella per gestire inviti pendenti. L'owner può invitare utenti che riceveranno email automatica via Supabase Auth.

### 5.3 impact (oggetto core)
```sql
impact (
  id uuid pk,
  workspace_id uuid fk,
  title text not null,
  description text,
  source_type text check (source_type in (
    'decision',
    'incident',
    'audit',
    'requirement',
    'organizational',
    'technical',
    'near_miss'
  )),
  status text check (status in (
    'draft',
    'assessed',
    'actions_open',
    'closed'
  )),
  created_by uuid fk auth.users,
  created_at timestamp,
  updated_at timestamp,
  archived_at timestamp  -- NEW: soft delete
)
```

> `source_type` è **opzionale** per l'MVP (serve per analisi future).
>
> **Decisione soft delete**: Gli Impact non vengono mai eliminati fisicamente. `archived_at` nullo = attivo, timestamp = archiviato.

### 5.4 impact_area (reference table)
```sql
impact_area (
  key text pk,
  sort_order int
)
```

> **Nota**: Tabella minimale con solo key e ordine. Label, guidance e tutti i testi sono gestiti nel frontend via i18n.

Valori iniziali:
- asset_tools
- information_data
- access_privileges
- process_controls
- risk_impact
- policies_docs
- people_awareness

### 5.5 impact_area_state
```sql
impact_area_state (
  id uuid pk,
  impact_id uuid fk,
  area_key text fk impact_area,
  state text check (state in (
    'to_review',
    'impacted',
    'not_impacted'
  )),
  notes text,
  updated_at timestamp,
  updated_by uuid fk auth.users,
  unique (impact_id, area_key)
)
```

Regole:
- una riga per ogni area per ogni Impact;
- stato iniziale: `to_review`.

### 5.6 impact_action
```sql
impact_action (
  id uuid pk,
  impact_id uuid fk,
  area_key text fk impact_area,  -- nullable per azioni globali
  description text not null,
  owner uuid fk auth.users,
  due_date date,
  status text check (status in (
    'open',
    'done'
  )),
  created_at timestamp,
  closed_at timestamp
)
```

> **Nota**: `area_key` è nullable per supportare azioni che riguardano l'Impact in generale.

### 5.7 impact_reference
```sql
impact_reference (
  id uuid pk,
  impact_id uuid fk,
  area_key text fk impact_area,
  label text,
  url text not null,
  created_at timestamp
)
```

Serve solo a **puntare** documenti o sistemi esterni.

---

## 6. State Machine

### 6.1 Stato Impact (derivato)
- `draft`: tutte le aree `to_review`;
- `assessed`: nessuna `to_review`, nessuna azione aperta;
- `actions_open`: almeno una azione `open`;
- `closed`: nessuna `to_review` e nessuna azione `open`.

Lo stato **non è mai settato manualmente**.

### 6.2 Stato Area
- `to_review`
- `impacted`
- `not_impacted`

### 6.3 Stato Azione
- `open`
- `done`

---

## 7. Vincoli fondamentali

- Non è possibile chiudere un Impact se:
  - esiste almeno una area `to_review`;
  - esiste almeno una azione `open`.

Questi vincoli sono **la feature principale del prodotto**.

---

## 8. Explicit Out of Scope

- ISO control mapping;
- gestione SoA;
- risk register;
- document repository;
- workflow approvativi;
- automazioni decisionali;
- hard delete degli Impact (solo archiviazione);
- traduzione automatica contenuti utente.

---

## 9. Multilingua (MVP)

Decision Trail supporta **IT/EN** a livello di UI.

### 9.1 Principi
- Il database è **completamente language-agnostic** e utilizza solo key semantiche invarianti.
- Tutte le label, i testi di sistema e gli stati sono risolti nel **frontend tramite i18n**.
- I contenuti inseriti dagli utenti (titoli, descrizioni, note) **non sono tradotti**.

### 9.2 Cosa viene tradotto (frontend)
- Label delle 7 aree ISMS (`asset_tools` → "Asset & strumenti" / "Assets & Tools")
- Testi guida (guidance) per ogni area
- Stati (`to_review` → "Da valutare" / "To review")
- Source types (`decision` → "Decisione" / "Decision")
- UI labels, bottoni, messaggi di errore

### 9.3 Cosa NON viene tradotto
- `impact.title`
- `impact.description`
- `impact_area_state.notes`
- `impact_action.description`
- `impact_reference.label`

### 9.4 Implementazione
- Libreria: `next-intl` (consigliata per Next.js App Router)
- File: `/messages/it.json`, `/messages/en.json`
- Default: IT
- Routing: `/it/...`, `/en/...` oppure cookie-based

---

## 10. Multi-workspace (incluso in v1)

### 10.1 Caso d'uso
Un consulente ISO 27001 usa Decision Trail per gestire più clienti. Ogni cliente = un workspace separato. Il consulente switcha tra workspace senza logout.

### 10.2 UX richiesta
- **Workspace switcher** nell'header per cambiare workspace attivo
- **Pagina /workspaces** con lista workspace e creazione nuovo
- **Workspace nel URL path**: `/w/[workspaceId]/dashboard`, `/w/[workspaceId]/impacts`, etc.
  - Rende le pagine shareable
  - Semplifica i Server Components
  - Cookie `last_workspace_id` come fallback per redirect

### 10.3 Comportamento
- Al primo login: creazione automatica workspace + membership owner
- **Inviti multipli**: Se l'utente ha inviti pendenti da più workspace, vengono **tutti auto-accettati** al signup (non viene creato un workspace personale)
- Creazione nuovo workspace: l'utente diventa owner
- Switch workspace: navigazione a `/w/[nuovo-id]/dashboard`
- **Eliminazione workspace**: Solo owner può eliminare (hard delete con cascade, richiede conferma UI)

---

## 11. Architettura Auth & Workspace

> Documentazione completa in [auth-architecture.md](./auth-architecture.md)

Principi chiave:

- **Nessun utente senza workspace**: Trigger DB crea workspace automaticamente al signup
- **Multi-tenant**: Ogni workspace e isolato, RLS garantisce segregazione
- **Multi-workspace**: Un utente puo appartenere a N workspace
- **Ruoli**: Solo `owner` e `member` in v1

---

## 12. Future Hooks (non implementare ora)

- Analytics su `source_type`;
- suggerimenti AI di domande/azioni;
- collegamento opzionale a controlli ISO;
- esportazioni per audit;
- lingue aggiuntive (DE, FR, ES);
- dashboard aggregata cross-workspace per consulenti.

---

## 13. Summary

Questo MVP:
- risolve un problema reale e ricorrente;
- è piccolo ma completo;
- non è un questionario;
- non è un GRC;
- è difendibile in audit;
- è costruibile velocemente.

> **Decisione finale**: implementare esattamente quanto sopra, senza estensioni.

