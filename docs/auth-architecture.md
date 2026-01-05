# Auth & Workspace Architecture

Documentazione dettagliata del sistema di autenticazione e gestione workspace.

---

## Principi fondamentali

| Principio | Implementazione |
|-----------|-----------------|
| **Nessun utente senza workspace** | Trigger DB crea workspace automaticamente al signup |
| **Multi-tenant** | Ogni workspace e isolato, RLS garantisce segregazione |
| **Multi-workspace** | Un utente puo appartenere a N workspace (caso consulente) |
| **Ruoli semplici** | Solo `owner` e `member` in v1 |

---

## Tabelle core

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  workspace  │────<│ workspace_member │>────│  auth.users │
└─────────────┘     └──────────────────┘     └──────┬──────┘
       │                                            │
       │                                      ┌─────┴─────┐
       ▼                                      │  profiles │
┌──────────────────┐                          └───────────┘
│ workspace_       │
│ invitation       │
└──────────────────┘
```

### profiles

Profilo utente, 1:1 con `auth.users`. Convenzione Supabase.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### workspace

Contenitore multi-tenant per i dati.

```sql
CREATE TABLE workspace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### workspace_member

Relazione N:M utente-workspace con ruolo.

```sql
CREATE TABLE workspace_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'member',  -- 'owner' | 'member'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
```

### workspace_invitation

Inviti pendenti per nuovi membri.

```sql
CREATE TABLE workspace_invitation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role workspace_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status invitation_status DEFAULT 'pending',  -- 'pending' | 'accepted' | 'expired'
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  UNIQUE (workspace_id, email)
);
```

---

## Trigger: Auto-creazione profile + workspace

Quando un nuovo utente si registra su Supabase Auth, un trigger database gestisce automaticamente:

1. Creazione del record `profiles`
2. Verifica di **TUTTI** gli inviti pendenti per l'email
3. Se esistono inviti -> aggiunge a **tutti** i workspace con inviti pendenti
4. Se non esistono inviti -> crea nuovo workspace + membership come owner

> **Nota**: A differenza di versioni precedenti, il trigger ora processa **tutti** gli inviti pendenti, non solo il primo. Questo permette a un utente invitato da più workspace di essere aggiunto automaticamente a tutti al momento del signup.

```sql
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  pending_invite workspace_invitation%ROWTYPE;
  new_workspace_id UUID;
  has_accepted_any BOOLEAN := FALSE;
BEGIN
  -- 1. Crea sempre il profile
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );

  -- 2. Processa TUTTI gli inviti pendenti per questa email
  FOR pending_invite IN
    SELECT * FROM workspace_invitation
    WHERE email = NEW.email
      AND status = 'pending'
      AND expires_at > now()
    ORDER BY created_at ASC
  LOOP
    -- Aggiungi al workspace
    INSERT INTO workspace_member (workspace_id, user_id, role)
    VALUES (pending_invite.workspace_id, NEW.id, pending_invite.role)
    ON CONFLICT (workspace_id, user_id) DO NOTHING;

    -- Segna invito come accettato
    UPDATE workspace_invitation
    SET status = 'accepted', accepted_at = now()
    WHERE id = pending_invite.id;

    has_accepted_any := TRUE;
  END LOOP;

  -- 3. Se nessun invito accettato, crea nuovo workspace
  IF NOT has_accepted_any THEN
    INSERT INTO workspace (name, created_by)
    VALUES ('Il mio workspace', NEW.id)
    RETURNING id INTO new_workspace_id;

    INSERT INTO workspace_member (workspace_id, user_id, role)
    VALUES (new_workspace_id, NEW.id, 'owner');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger su auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();
```

**Perche SECURITY DEFINER?**
Il trigger gira con i permessi del creatore (superuser), bypassando RLS. Questo e necessario perche al momento dell'INSERT su `auth.users`, l'utente non ha ancora una sessione autenticata.

---

## Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato. Le policy garantiscono:

- **Isolamento workspace**: un utente vede solo i dati dei workspace di cui e membro
- **Nessun accesso cross-tenant**: impossibile accedere a dati di altri workspace
- **Nessun accesso anonimo**: tutte le policy richiedono `auth.uid() IS NOT NULL`

### Policy su profiles

```sql
-- GDPR: vedi SOLO te stesso (dati non segregati per workspace_id)
-- Per ottenere dati di altri utenti, usa RPC functions che restituiscono solo dati necessari
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  id = auth.uid()
);

-- Aggiorna solo il tuo profilo
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
```

**Nota GDPR**: La tabella `profiles` non ha `workspace_id`, quindi non può essere segregata per workspace. Per rispettare il principio di minimizzazione dei dati, la policy SELECT è ristretta al solo utente corrente. I dati di altri utenti (es. creatore di un impact) sono esposti tramite RPC functions che:
1. Verificano l'accesso al workspace
2. Restituiscono solo i campi necessari (email, nome)
3. Sono già presenti: `get_workspace_members()`, `get_workspace_impacts()`, `get_impact_detail()`

### Policy su workspace

```sql
-- Vedi solo i workspace di cui sei membro
CREATE POLICY "workspace_select" ON workspace FOR SELECT USING (
  id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
);
```

### Policy su workspace_member

```sql
-- Vedi solo le tue membership (evita ricorsione!)
CREATE POLICY "workspace_member_select" ON workspace_member FOR SELECT USING (
  user_id = auth.uid()
);
```

**Nota importante**: La policy su `workspace_member` usa solo `user_id = auth.uid()` per evitare ricorsione infinita. Le operazioni di modifica (INSERT/UPDATE/DELETE) sono gestite tramite RPC functions.

### Policy su workspace_invitation

```sql
-- Owner vede inviti del suo workspace, invitato vede i suoi
CREATE POLICY "invitation_select" ON workspace_invitation FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_member
    WHERE user_id = auth.uid() AND role = 'owner'
  )
  OR email = (SELECT email FROM profiles WHERE id = auth.uid())
);
```

---

## RPC Functions (SECURITY DEFINER)

Per operazioni che richiedono privilegi elevati o devono bypassare RLS, usiamo funzioni PL/pgSQL con `SECURITY DEFINER`.

### create_workspace

Crea un nuovo workspace e aggiunge l'utente corrente come owner.

```sql
CREATE OR REPLACE FUNCTION create_workspace(workspace_name TEXT)
RETURNS UUID AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  INSERT INTO workspace (name, created_by)
  VALUES (workspace_name, auth.uid())
  RETURNING id INTO new_workspace_id;

  INSERT INTO workspace_member (workspace_id, user_id, role)
  VALUES (new_workspace_id, auth.uid(), 'owner');

  RETURN new_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### send_workspace_invitation

Crea un invito (solo owner puo invitare).

```sql
CREATE OR REPLACE FUNCTION send_workspace_invitation(
  p_workspace_id UUID,
  p_email TEXT,
  p_role workspace_role DEFAULT 'member'
)
RETURNS UUID AS $$
DECLARE
  invitation_id UUID;
BEGIN
  -- Verifica owner
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only workspace owners can send invitations';
  END IF;

  -- Verifica non gia membro
  IF EXISTS (
    SELECT 1 FROM workspace_member wm
    JOIN profiles p ON p.id = wm.user_id
    WHERE wm.workspace_id = p_workspace_id
      AND p.email = p_email
  ) THEN
    RAISE EXCEPTION 'User is already a member of this workspace';
  END IF;

  -- Crea o aggiorna invito
  INSERT INTO workspace_invitation (workspace_id, email, role, invited_by)
  VALUES (p_workspace_id, p_email, p_role, auth.uid())
  ON CONFLICT (workspace_id, email)
  DO UPDATE SET
    role = p_role,
    invited_by = auth.uid(),
    status = 'pending',
    created_at = now(),
    expires_at = now() + INTERVAL '7 days',
    accepted_at = NULL
  RETURNING id INTO invitation_id;

  RETURN invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_user_workspaces

Lista workspace dell'utente con conteggi.

```sql
CREATE OR REPLACE FUNCTION get_user_workspaces()
RETURNS TABLE (
  id UUID,
  name TEXT,
  role workspace_role,
  member_count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.name,
    wm.role,
    (SELECT COUNT(*) FROM workspace_member WHERE workspace_id = w.id),
    w.created_at
  FROM workspace w
  JOIN workspace_member wm ON wm.workspace_id = w.id
  WHERE wm.user_id = auth.uid()
  ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### cancel_workspace_invitation

Annulla un invito pendente. Solo owner può annullare.

```sql
CREATE OR REPLACE FUNCTION cancel_workspace_invitation(p_invitation_id UUID)
RETURNS BOOLEAN AS $$
-- Verifica owner, poi DELETE workspace_invitation
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### update_member_role

Promuove o declassa un membro. Solo owner può modificare ruoli.

```sql
CREATE OR REPLACE FUNCTION update_member_role(
  p_workspace_id UUID,
  p_user_id UUID,
  p_new_role workspace_role
)
RETURNS BOOLEAN AS $$
-- Verifica owner, previene declassamento ultimo owner
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### delete_workspace

Elimina un workspace e tutti i dati correlati (cascade). Solo owner.

```sql
CREATE OR REPLACE FUNCTION delete_workspace(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
-- Verifica owner, poi DELETE workspace (cascade)
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_workspace_pending_invitations

Lista gli inviti pendenti di un workspace. Solo owner può vedere.

```sql
CREATE OR REPLACE FUNCTION get_workspace_pending_invitations(p_workspace_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  role workspace_role,
  invited_by UUID,
  invited_by_email TEXT,
  invited_by_name TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
-- Verifica owner, poi SELECT workspace_invitation JOIN profiles
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### rename_workspace

Rinomina un workspace. Solo owner.

```sql
CREATE OR REPLACE FUNCTION rename_workspace(
  p_workspace_id UUID,
  p_new_name TEXT
)
RETURNS BOOLEAN AS $$
-- Verifica owner, valida nome non vuoto, poi UPDATE workspace
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### leave_workspace

Permette a un membro di abbandonare un workspace.

```sql
CREATE OR REPLACE FUNCTION leave_workspace(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
-- Verifica membro, previene abbandono ultimo owner
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

> **Nota**: Per il codice completo di queste funzioni, vedere [supabase/schema.sql](../supabase/schema.sql).

---

## Flussi di autenticazione

### Flow 1: Signup diretto (nuovo utente)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Utente inserisce email su /auth/login                        │
│ 2. Supabase invia Magic Link                                    │
│ 3. Utente clicca link -> /auth/callback?code=XXX                │
│ 4. Callback: exchangeCodeForSession()                           │
│ 5. TRIGGER on_auth_user_created si attiva:                      │
│    ├─ Crea record in profiles                                   │
│    ├─ Cerca inviti pendenti per email -> nessuno                │
│    └─ Crea workspace + membership (owner)                       │
│ 6. Redirect a /dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: Signup da invito

```
┌─────────────────────────────────────────────────────────────────┐
│ OWNER:                                                          │
│ 1. Va su /workspaces/[id]/members                               │
│ 2. Inserisce email dell'invitato                                │
│ 3. Frontend chiama POST /api/invitations/send                   │
│ 4. API: RPC send_workspace_invitation + inviteUserByEmail()     │
│ 5. Supabase invia email automaticamente                         │
│                                                                 │
│ INVITATO:                                                       │
│ 1. Riceve email da Supabase                                     │
│ 2. Clicca link -> /auth/callback?code=XXX                       │
│ 3. TRIGGER on_auth_user_created si attiva:                      │
│    ├─ Crea record in profiles                                   │
│    ├─ Trova invito pendente per email                           │
│    └─ Aggiunge al workspace con ruolo da invito (member)        │
│ 4. Redirect a /dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Roles in Supabase

Supabase usa diversi ruoli Postgres:

| Ruolo | Uso | RLS |
|-------|-----|-----|
| `anon` | Richieste non autenticate | Si applica |
| `authenticated` | Richieste con JWT valido | Si applica |
| `service_role` | Backend con service key | **Bypassa RLS** |
| `postgres` | Superuser (migrazioni) | Bypassa tutto |

**Nel nostro caso:**

- **Frontend (client)**: usa `anon` key -> tutte le query passano per RLS
- **API Routes (server)**: usa `service_role` key solo per `inviteUserByEmail()` -> bypassa RLS
- **Trigger DB**: usa `SECURITY DEFINER` -> gira come creatore (superuser)

---

## Invio email inviti

Gli inviti sono inviati tramite `supabase.auth.admin.inviteUserByEmail()`:

```typescript
// /src/app/api/invitations/send/route.ts
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Richiesto per admin API
);

// Dopo aver creato l'invito nel DB...
await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
});
```

L'email viene inviata dal servizio email integrato di Supabase (o SMTP custom se configurato).
