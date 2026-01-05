# Database Guide - Decision Trail

Guida pratica al database di Decision Trail per sviluppatori frontend. Non richiede conoscenze avanzate di SQL.

---

## Indice

1. [Concetti base](#concetti-base)
2. [Struttura del database](#struttura-del-database)
3. [Come funziona la sicurezza (RLS)](#come-funziona-la-sicurezza-rls)
4. [RPC Functions - La tua API al database](#rpc-functions---la-tua-api-al-database)
5. [Esempi pratici con Supabase JS](#esempi-pratici-con-supabase-js)
6. [Troubleshooting](#troubleshooting)

---

## Concetti base

### Cos'è una RPC Function?

Una **RPC (Remote Procedure Call) function** è una funzione che vive nel database e che puoi chiamare dal frontend. Pensa a loro come delle **API endpoints** ma che girano direttamente nel database.

**Perché le usiamo?**
- Fanno più operazioni in una sola chiamata (es: crea impact + crea 7 stati area)
- Hanno permessi speciali per operazioni complesse
- Garantiscono che i dati siano sempre consistenti

```typescript
// Invece di fare 8 chiamate separate...
await supabase.from('impact').insert(...)
await supabase.from('impact_area_state').insert(...) // x7

// ...fai UNA sola chiamata RPC
await supabase.rpc('create_impact', { ws_id: '...', p_title: 'Titolo' })
```

### Cos'è RLS (Row Level Security)?

RLS è il sistema di sicurezza del database. Funziona come un **filtro automatico** su ogni query.

Immagina di avere una tabella `impact` con 1000 righe di 50 workspace diversi. Quando fai:

```typescript
const { data } = await supabase.from('impact').select('*')
```

**Senza RLS**: Vedresti tutti i 1000 impact (disastro!)
**Con RLS**: Vedi solo gli impact del TUO workspace (es: 20 righe)

Il filtro è **automatico e invisibile**. Non devi mai scrivere `WHERE workspace_id = ...` - lo fa RLS per te.

### Workspace: Il contenitore di tutto

In Decision Trail, ogni dato appartiene a un **workspace**. Un workspace è come un "account aziendale":

- Ogni utente ha almeno 1 workspace
- Un utente può appartenere a più workspace (es: consulente)
- I dati di un workspace sono **invisibili** agli altri workspace

```
┌─────────────────────────────────────────────────────────┐
│                    WORKSPACE "Acme Corp"                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Impact 1 │  │ Impact 2 │  │ Impact 3 │  ...         │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
│  Membri: Mario (owner), Luigi (member), Anna (member)   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    WORKSPACE "Beta Srl"                 │
│  ┌──────────┐  ┌──────────┐                            │
│  │ Impact A │  │ Impact B │  ...                       │
│  └──────────┘  └──────────┘                            │
│                                                         │
│  Membri: Paolo (owner), Mario (member)                  │
└─────────────────────────────────────────────────────────┘

Mario vede entrambi i workspace, Luigi vede solo "Acme Corp"
```

---

## Struttura del database

### Diagramma delle tabelle

```
┌─────────────────┐
│    profiles     │ ← Dati utente (email, nome, avatar)
└────────┬────────┘
         │ 1:1 con auth.users (gestito da Supabase)
         │
         │
┌────────┴────────┐         ┌──────────────────┐
│    workspace    │────────<│ workspace_member │
│                 │         │                  │
│ - name          │         │ - role (owner/   │
│ - created_by    │         │         member)  │
└────────┬────────┘         └──────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐         ┌──────────────────┐
│     impact      │────────<│ impact_area_state│
│                 │         │                  │
│ - title         │         │ - area_key       │
│ - description   │         │ - state          │
│ - source_type   │         │ - notes          │
│ - archived_at   │         └──────────────────┘
└────────┬────────┘
         │ 1:N
         ├─────────────────┐
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│  impact_action  │ │impact_reference │
│                 │ │                 │
│ - description   │ │ - label         │
│ - owner         │ │ - url           │
│ - due_date      │ └─────────────────┘
│ - status        │
└─────────────────┘
```

### Tabelle in dettaglio

#### `profiles` - Chi sei tu

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Stesso ID di auth.users |
| email | TEXT | La tua email |
| full_name | TEXT | Nome completo (opzionale) |
| avatar_url | TEXT | URL immagine profilo |

**Nota importante**: Puoi vedere **solo il tuo profilo**. Per vedere dati di altri utenti (es: chi ha creato un impact), usa le RPC functions che restituiscono solo i campi necessari.

#### `workspace` - Il contenitore

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificativo unico |
| name | TEXT | Nome del workspace |
| created_by | UUID | Chi l'ha creato |

#### `workspace_member` - Chi appartiene a cosa

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| workspace_id | UUID | Quale workspace |
| user_id | UUID | Quale utente |
| role | ENUM | `owner` oppure `member` |

**Ruoli:**
- `owner`: Può invitare/rimuovere membri, rinominare workspace, eliminare impact
- `member`: Può creare/modificare impact, ma non gestire membri

#### `impact` - L'oggetto principale

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificativo unico |
| workspace_id | UUID | A quale workspace appartiene |
| title | TEXT | Titolo dell'impact |
| description | TEXT | Descrizione dettagliata |
| source_type | ENUM | Tipo di origine (vedi sotto) |
| created_by | UUID | Chi l'ha creato |
| archived_at | TIMESTAMP | Se valorizzato, l'impact è "cancellato" |

**Tipi di source_type:**
- `decision` - Decisione aziendale
- `incident` - Incidente di sicurezza
- `audit` - Risultato di audit
- `requirement` - Nuovo requisito normativo
- `organizational` - Cambio organizzativo
- `technical` - Cambio tecnico
- `near_miss` - Quasi-incidente

#### `impact_area_state` - Stato delle 7 aree ISMS

Ogni impact ha **sempre** 7 record in questa tabella, uno per ogni area ISMS.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| impact_id | UUID | Quale impact |
| area_key | TEXT | Quale area (vedi sotto) |
| state | ENUM | `to_review`, `impacted`, `not_impacted` |
| notes | TEXT | Note opzionali |

**Le 7 aree ISMS:**
1. `asset_tools` - Asset e strumenti
2. `information_data` - Informazioni e dati
3. `access_privileges` - Accessi e privilegi
4. `process_controls` - Processi e controlli
5. `risk_impact` - Rischi e impatti
6. `policies_docs` - Policy e documentazione
7. `people_awareness` - Persone e awareness

#### `impact_action` - Cose da fare

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| impact_id | UUID | Quale impact |
| area_key | TEXT | Quale area (opzionale) |
| description | TEXT | Cosa fare |
| owner | UUID | Chi deve farlo |
| due_date | DATE | Entro quando |
| status | ENUM | `open` oppure `done` |

#### `impact_reference` - Link utili

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| impact_id | UUID | Quale impact |
| area_key | TEXT | Quale area (opzionale) |
| label | TEXT | Etichetta del link |
| url | TEXT | URL completo |

---

## Come funziona la sicurezza (RLS)

### Il principio: "Non fidarti mai del frontend"

Anche se il frontend invia una query corretta, il database **verifica sempre** che l'utente abbia i permessi. Questo significa che:

1. Non puoi vedere dati di altri workspace
2. Non puoi modificare dati che non ti appartengono
3. Non puoi "imbrogliare" il sistema cambiando gli ID nelle richieste

### Esempio pratico

```typescript
// Immagina di essere Mario, membro di "Acme Corp" (workspace_id: abc-123)

// QUERY 1: Vedi i tuoi impact
const { data } = await supabase.from('impact').select('*')
// Risultato: Solo impact di "Acme Corp" (il tuo workspace)

// QUERY 2: Provi a vedere impact di un altro workspace
const { data } = await supabase
  .from('impact')
  .select('*')
  .eq('workspace_id', 'altro-workspace-xyz')
// Risultato: Array vuoto [] - RLS blocca silenziosamente

// QUERY 3: Provi a modificare un impact non tuo
const { error } = await supabase
  .from('impact')
  .update({ title: 'Hacked!' })
  .eq('id', 'impact-di-altro-workspace')
// Risultato: Nessuna riga modificata - RLS blocca silenziosamente
```

### Quando usare query dirette vs RPC

| Operazione | Metodo | Perché |
|------------|--------|--------|
| Leggere il mio profilo | Query diretta | `profiles` ha RLS semplice |
| Leggere impact del workspace | Query diretta | `impact` ha RLS su workspace |
| Creare un nuovo impact | **RPC** | Deve creare anche i 7 area_state |
| Lista membri workspace | **RPC** | Evita problemi di ricorsione RLS |
| Vedere chi ha creato un impact | **RPC** | Policy su profiles è restrittiva |

---

## RPC Functions - La tua API al database

### Panoramica delle funzioni disponibili

| Funzione | Scopo | Chi può usarla |
|----------|-------|----------------|
| `get_user_workspaces()` | Lista workspace dell'utente | Tutti |
| `get_workspace_impacts(ws_id)` | Lista impact di un workspace | Membri |
| `get_impact_detail(impact_id)` | Dettaglio singolo impact | Membri |
| `get_workspace_members(ws_id)` | Lista membri di un workspace | Membri |
| `get_workspace_pending_invitations(ws_id)` | Lista inviti pendenti | Solo owner |
| `create_workspace(name)` | Crea nuovo workspace | Tutti |
| `create_impact(ws_id, title, ...)` | Crea impact + stati area | Membri |
| `update_impact(id, title, ...)` | Modifica impact | Membri |
| `archive_impact(id)` | Soft-delete impact | Membri |
| `update_area_state(impact_id, area_key, state, notes)` | Cambia stato area | Membri |
| `send_workspace_invitation(ws_id, email, role)` | Invita membro | Solo owner |
| `accept_workspace_invitation(inv_id)` | Accetta invito | Invitato |
| `cancel_workspace_invitation(inv_id)` | Annulla invito pendente | Solo owner |
| `remove_workspace_member(ws_id, user_id)` | Rimuovi membro | Solo owner |
| `update_member_role(ws_id, user_id, role)` | Promuovi/declassa membro | Solo owner |
| `rename_workspace(ws_id, new_name)` | Rinomina workspace | Solo owner |
| `delete_workspace(ws_id)` | Elimina workspace (cascade) | Solo owner |
| `leave_workspace(ws_id)` | Abbandona workspace | Membri |

### Dettaglio funzioni

#### `get_user_workspaces()`

Restituisce tutti i workspace di cui l'utente è membro.

```typescript
const { data, error } = await supabase.rpc('get_user_workspaces')

// Risultato:
[
  {
    id: "abc-123",
    name: "Acme Corp",
    role: "owner",
    member_count: 5,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "def-456",
    name: "Beta Srl",
    role: "member",
    member_count: 3,
    created_at: "2024-02-20T14:30:00Z"
  }
]
```

#### `get_workspace_impacts(ws_id)`

Restituisce tutti gli impact (non archiviati) di un workspace con conteggi aggregati.

```typescript
const { data, error } = await supabase.rpc('get_workspace_impacts', {
  ws_id: 'abc-123'
})

// Risultato:
[
  {
    id: "impact-001",
    title: "Migrazione cloud AWS",
    description: "Spostamento infrastruttura...",
    source_type: "technical",
    status: "draft",         // Stato calcolato: "draft" | "actions_open" | "closed"
    created_by: "user-uuid",
    created_by_email: "mario@acme.com",
    created_by_name: "Mario Rossi",
    created_at: "2024-03-01T09:00:00Z",
    updated_at: "2024-03-05T16:20:00Z",
    areas_to_review: 2,      // Quante aree sono ancora "to_review"
    areas_impacted: 4,       // Quante aree sono "impacted"
    areas_not_impacted: 1,   // Quante aree sono "not_impacted"
    actions_open: 3,         // Azioni ancora da fare
    actions_done: 5          // Azioni completate
  },
  // ...altri impact
]
```

#### `get_impact_detail(p_impact_id)`

Restituisce i dettagli base di un singolo impact.

```typescript
const { data, error } = await supabase.rpc('get_impact_detail', {
  p_impact_id: 'impact-001'
})

// Risultato (array con 1 elemento):
[
  {
    id: "impact-001",
    workspace_id: "abc-123",
    title: "Migrazione cloud AWS",
    description: "Spostamento infrastruttura...",
    source_type: "technical",
    status: "draft",         // Stato calcolato: "draft" | "actions_open" | "closed"
    created_by: "user-uuid",
    created_by_email: "mario@acme.com",
    created_by_name: "Mario Rossi",
    created_at: "2024-03-01T09:00:00Z",
    updated_at: "2024-03-05T16:20:00Z"
  }
]
```

**Nota**: Per ottenere gli stati delle aree, le azioni e i riferimenti, fai query separate:

```typescript
// Stati delle 7 aree
const { data: states } = await supabase
  .from('impact_area_state')
  .select('*')
  .eq('impact_id', 'impact-001')
  .order('area_key')

// Azioni
const { data: actions } = await supabase
  .from('impact_action')
  .select('*')
  .eq('impact_id', 'impact-001')

// Riferimenti
const { data: refs } = await supabase
  .from('impact_reference')
  .select('*')
  .eq('impact_id', 'impact-001')
```

#### `get_workspace_members(p_workspace_id)`

Restituisce la lista dei membri di un workspace.

```typescript
const { data, error } = await supabase.rpc('get_workspace_members', {
  p_workspace_id: 'abc-123'
})

// Risultato:
[
  {
    user_id: "user-001",
    role: "owner",
    email: "mario@acme.com",
    full_name: "Mario Rossi",
    avatar_url: "https://...",
    joined_at: "2024-01-15T10:00:00Z"
  },
  {
    user_id: "user-002",
    role: "member",
    email: "luigi@acme.com",
    full_name: "Luigi Verdi",
    avatar_url: null,
    joined_at: "2024-01-20T11:30:00Z"
  }
]
```

#### `create_impact(ws_id, p_title, p_description, p_source_type)`

Crea un nuovo impact e automaticamente inizializza i 7 stati area a `to_review`.

```typescript
const { data: impactId, error } = await supabase.rpc('create_impact', {
  ws_id: 'abc-123',
  p_title: 'Nuovo requisito GDPR',
  p_description: 'La nuova normativa richiede...',
  p_source_type: 'requirement'  // Opzionale
})

// Risultato: "nuovo-impact-uuid"
```

#### `update_impact(p_impact_id, p_title, p_description, p_source_type)`

Modifica un impact esistente. I parametri sono opzionali: passa solo quelli che vuoi modificare.

```typescript
// Modifica solo il titolo
const { data, error } = await supabase.rpc('update_impact', {
  p_impact_id: 'impact-001',
  p_title: 'Titolo aggiornato'
  // p_description e p_source_type restano invariati
})

// Modifica descrizione e tipo
const { data, error } = await supabase.rpc('update_impact', {
  p_impact_id: 'impact-001',
  p_description: 'Nuova descrizione dettagliata',
  p_source_type: 'incident'
})
```

#### `archive_impact(p_impact_id)`

"Cancella" un impact (soft delete). L'impact non viene eliminato fisicamente, ma scompare da tutte le query.

```typescript
const { data, error } = await supabase.rpc('archive_impact', {
  p_impact_id: 'impact-001'
})

// Risultato: true se archiviato, false se non trovato
```

#### `update_area_state(p_impact_id, p_area_key, p_state, p_notes)`

Aggiorna lo stato di un'area ISMS per un impact.

```typescript
const { data, error } = await supabase.rpc('update_area_state', {
  p_impact_id: 'impact-001',
  p_area_key: 'access_privileges',
  p_state: 'impacted',
  p_notes: 'Necessario rivedere le ACL dei bucket S3'  // Opzionale
})

// Risultato: true se aggiornato
```

**Stati possibili:**
- `to_review` - Da valutare
- `impacted` - Area impattata (richiede azioni)
- `not_impacted` - Area non impattata

#### `create_workspace(workspace_name)`

Crea un nuovo workspace e imposta l'utente corrente come owner.

```typescript
const { data: workspaceId, error } = await supabase.rpc('create_workspace', {
  workspace_name: 'Nuovo Progetto'
})

// Risultato: "nuovo-workspace-uuid"
```

#### `send_workspace_invitation(p_workspace_id, p_email, p_role)`

Crea un invito per un nuovo membro. **Solo gli owner possono invitare.**

```typescript
const { data: invitationId, error } = await supabase.rpc('send_workspace_invitation', {
  p_workspace_id: 'abc-123',
  p_email: 'nuovo@collega.com',
  p_role: 'member'  // Opzionale, default: 'member'
})

// Risultato: "invitation-uuid"
// NOTA: Questa funzione crea solo il record nel DB.
// L'invio email va fatto separatamente tramite API route.
```

#### `accept_workspace_invitation(p_invitation_id)`

Accetta un invito pendente. L'utente deve essere autenticato con la stessa email dell'invito.

```typescript
const { data, error } = await supabase.rpc('accept_workspace_invitation', {
  p_invitation_id: 'invitation-uuid'
})

// Risultato: true se accettato
```

#### `remove_workspace_member(p_workspace_id, p_user_id)`

Rimuove un membro dal workspace. **Solo gli owner possono rimuovere.**

```typescript
const { data, error } = await supabase.rpc('remove_workspace_member', {
  p_workspace_id: 'abc-123',
  p_user_id: 'user-da-rimuovere'
})

// Risultato: true se rimosso
```

**Nota**: Un owner non può rimuovere se stesso se è l'unico owner.

#### `cancel_workspace_invitation(p_invitation_id)`

Annulla un invito pendente. **Solo gli owner possono annullare.**

```typescript
const { data, error } = await supabase.rpc('cancel_workspace_invitation', {
  p_invitation_id: 'invitation-uuid'
})

// Risultato: true se annullato
```

#### `update_member_role(p_workspace_id, p_user_id, p_new_role)`

Promuove un membro a owner o declassa un owner a member. **Solo gli owner possono modificare ruoli.**

```typescript
// Promuovi a owner
const { data, error } = await supabase.rpc('update_member_role', {
  p_workspace_id: 'abc-123',
  p_user_id: 'user-002',
  p_new_role: 'owner'
})

// Risultato: true se modificato
```

**Nota**: Un owner non può declassare se stesso se è l'unico owner.

#### `rename_workspace(p_workspace_id, p_new_name)`

Rinomina un workspace. **Solo gli owner possono rinominare.**

```typescript
const { data, error } = await supabase.rpc('rename_workspace', {
  p_workspace_id: 'abc-123',
  p_new_name: 'Nuovo Nome Workspace'
})

// Risultato: true se rinominato
```

#### `delete_workspace(p_workspace_id)`

Elimina permanentemente un workspace e tutti i dati correlati (membri, inviti, impact, azioni, etc.). **Solo gli owner possono eliminare. Operazione irreversibile!**

```typescript
const { data, error } = await supabase.rpc('delete_workspace', {
  p_workspace_id: 'abc-123'
})

// Risultato: true se eliminato
```

**Attenzione**: Questa operazione è definitiva. Implementa sempre una conferma UI prima di chiamare questa funzione.

#### `leave_workspace(p_workspace_id)`

Permette a un utente di abbandonare volontariamente un workspace.

```typescript
const { data, error } = await supabase.rpc('leave_workspace', {
  p_workspace_id: 'abc-123'
})

// Risultato: true se abbandonato
```

**Nota**: Un owner non può abbandonare se è l'unico owner. Deve prima promuovere un altro membro a owner oppure eliminare il workspace.

#### `get_workspace_pending_invitations(p_workspace_id)`

Restituisce la lista degli inviti pendenti (non ancora accettati e non scaduti). **Solo gli owner possono vedere.**

```typescript
const { data, error } = await supabase.rpc('get_workspace_pending_invitations', {
  p_workspace_id: 'abc-123'
})

// Risultato:
[
  {
    id: "invitation-001",
    email: "nuovo@collega.com",
    role: "member",
    invited_by: "user-001",
    invited_by_email: "mario@acme.com",
    invited_by_name: "Mario Rossi",
    created_at: "2024-03-01T10:00:00Z",
    expires_at: "2024-03-08T10:00:00Z"  // 7 giorni dopo
  }
]
```

---

## Esempi pratici con Supabase JS

### Setup del client

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Pattern comune: Loading state + Error handling

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ImpactList({ workspaceId }: { workspaceId: string }) {
  const [impacts, setImpacts] = useState<Impact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadImpacts() {
      const supabase = createClient()

      const { data, error } = await supabase.rpc('get_workspace_impacts', {
        ws_id: workspaceId
      })

      if (error) {
        setError(error.message)
      } else {
        setImpacts(data || [])
      }
      setLoading(false)
    }

    loadImpacts()
  }, [workspaceId])

  if (loading) return <div>Caricamento...</div>
  if (error) return <div>Errore: {error}</div>
  if (impacts.length === 0) return <div>Nessun impact</div>

  return (
    <ul>
      {impacts.map(impact => (
        <li key={impact.id}>{impact.title}</li>
      ))}
    </ul>
  )
}
```

### Creare un nuovo impact

```typescript
async function createNewImpact(
  workspaceId: string,
  title: string,
  description: string,
  sourceType?: string
) {
  const supabase = createClient()

  const { data: impactId, error } = await supabase.rpc('create_impact', {
    ws_id: workspaceId,
    p_title: title,
    p_description: description,
    p_source_type: sourceType || null
  })

  if (error) {
    throw new Error(`Errore creazione impact: ${error.message}`)
  }

  return impactId
}
```

### Aggiornare lo stato di un'area

```typescript
async function updateAreaState(
  impactId: string,
  areaKey: string,
  newState: 'to_review' | 'impacted' | 'not_impacted',
  notes?: string
) {
  const supabase = createClient()

  const { error } = await supabase.rpc('update_area_state', {
    p_impact_id: impactId,
    p_area_key: areaKey,
    p_state: newState,
    p_notes: notes || null
  })

  if (error) {
    throw new Error(`Errore aggiornamento area: ${error.message}`)
  }
}
```

### Creare un'azione

```typescript
async function createAction(
  impactId: string,
  description: string,
  options?: {
    areaKey?: string
    ownerId?: string
    dueDate?: string
  }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('impact_action')
    .insert({
      impact_id: impactId,
      description: description,
      area_key: options?.areaKey || null,
      owner: options?.ownerId || null,
      due_date: options?.dueDate || null
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Errore creazione azione: ${error.message}`)
  }

  return data
}
```

### Completare un'azione

```typescript
async function completeAction(actionId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('impact_action')
    .update({
      status: 'done',
      closed_at: new Date().toISOString()
    })
    .eq('id', actionId)

  if (error) {
    throw new Error(`Errore completamento azione: ${error.message}`)
  }
}
```

### Aggiungere un riferimento

```typescript
async function addReference(
  impactId: string,
  url: string,
  label?: string,
  areaKey?: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('impact_reference')
    .insert({
      impact_id: impactId,
      url: url,
      label: label || null,
      area_key: areaKey || null
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Errore aggiunta riferimento: ${error.message}`)
  }

  return data
}
```

### Pattern: Realtime subscription

> **Nota v1**: Realtime è **nice-to-have**, non implementato in MVP. Questa sezione è documentazione di riferimento per future implementazioni. Per v1, usare refresh manuale o polling.

Supabase supporta aggiornamenti in tempo reale. Ecco come ascoltare le modifiche:

```typescript
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useImpactUpdates(
  impactId: string,
  onUpdate: () => void
) {
  useEffect(() => {
    const supabase = createClient()

    // Ascolta modifiche all'impact
    const channel = supabase
      .channel(`impact-${impactId}`)
      .on(
        'postgres_changes',
        {
          event: '*',  // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'impact',
          filter: `id=eq.${impactId}`
        },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'impact_area_state',
          filter: `impact_id=eq.${impactId}`
        },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'impact_action',
          filter: `impact_id=eq.${impactId}`
        },
        () => onUpdate()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [impactId, onUpdate])
}
```

---

## Troubleshooting

### Errore: "Access denied to this workspace"

**Causa**: Stai cercando di accedere a un workspace di cui non sei membro.

**Soluzione**:
1. Verifica che l'utente sia loggato
2. Verifica che il `workspace_id` sia corretto
3. Controlla che l'utente sia effettivamente membro del workspace

```typescript
// Debug: verifica i workspace dell'utente
const { data: workspaces } = await supabase.rpc('get_user_workspaces')
console.log('I miei workspace:', workspaces)
```

### Errore: "Impact not found or access denied"

**Causa**: L'impact non esiste, è archiviato, o non hai accesso.

**Soluzione**:
1. Verifica che l'`impact_id` sia corretto
2. L'impact potrebbe essere stato archiviato (soft-deleted)
3. Verifica di essere membro del workspace a cui appartiene

### Query restituisce array vuoto quando dovrebbe avere dati

**Causa comune**: RLS sta filtrando i risultati perché non hai i permessi.

**Debug**:
```typescript
// 1. Verifica di essere autenticato
const { data: { user } } = await supabase.auth.getUser()
console.log('Utente corrente:', user?.id)

// 2. Verifica i tuoi workspace
const { data: workspaces } = await supabase.rpc('get_user_workspaces')
console.log('I miei workspace:', workspaces)

// 3. Verifica che il workspace_id sia nella lista
```

### Errore: "Only workspace owners can..."

**Causa**: Stai cercando di fare un'operazione riservata agli owner (invitare, rimuovere membri).

**Soluzione**:
1. Verifica il tuo ruolo nel workspace
2. Chiedi a un owner di fare l'operazione

```typescript
// Verifica il tuo ruolo
const { data: workspaces } = await supabase.rpc('get_user_workspaces')
const myRole = workspaces?.find(w => w.id === workspaceId)?.role
console.log('Il mio ruolo:', myRole)  // "owner" o "member"
```

### Errore: "Cannot remove the last owner"

**Causa**: Stai cercando di rimuoverti come owner, ma sei l'unico owner del workspace.

**Soluzione**:
1. Prima promuovi un altro membro a owner
2. Poi puoi rimuoverti o farti declassare a member

### Errore: "Cannot leave as the last owner"

**Causa**: Stai cercando di abbandonare un workspace di cui sei l'unico owner.

**Soluzione**:
1. Promuovi prima un altro membro a owner usando `update_member_role()`
2. Poi potrai abbandonare con `leave_workspace()`
3. In alternativa, elimina il workspace con `delete_workspace()`

```typescript
// Opzione 1: Promuovi e abbandona
await supabase.rpc('update_member_role', {
  p_workspace_id: 'abc-123',
  p_user_id: 'altro-utente',
  p_new_role: 'owner'
})
await supabase.rpc('leave_workspace', { p_workspace_id: 'abc-123' })

// Opzione 2: Elimina il workspace
await supabase.rpc('delete_workspace', { p_workspace_id: 'abc-123' })
```

### Errore: "Cannot demote yourself as the last owner"

**Causa**: Stai cercando di declassarti da owner a member, ma sei l'unico owner.

**Soluzione**: Stessa di sopra - prima promuovi un altro membro a owner.

### Le modifiche non appaiono in tempo reale

**Causa**: I trigger `updated_at` potrebbero non essere attivi, o la subscription non è configurata correttamente.

**Debug**:
1. Verifica che i trigger esistano nel database
2. Verifica che il canale realtime sia sottoscritto correttamente
3. Controlla i log della console per errori di subscription

### Errore TypeScript: tipi non corrispondono

**Causa**: I tipi generati da Supabase potrebbero essere obsoleti.

**Soluzione**:
```bash
# Rigenera i tipi dal database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

---

## Riferimenti

| Risorsa | Link |
|---------|------|
| Schema SQL completo | [supabase/schema.sql](../supabase/schema.sql) |
| Architettura Auth | [docs/auth-architecture.md](./auth-architecture.md) |
| Supabase Docs | [supabase.com/docs](https://supabase.com/docs) |
| Supabase JS Client | [supabase.com/docs/reference/javascript](https://supabase.com/docs/reference/javascript) |
