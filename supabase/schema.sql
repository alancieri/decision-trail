-- =============================================================================
-- DECISION TRAIL - Database Schema
-- =============================================================================
-- Schema completo per Decision Trail MVP:
-- - Autenticazione (profiles)
-- - Multi-workspace con isolamento RLS
-- - Sistema di inviti
-- - Trigger automatico per signup
-- - Core business logic (Impact, Areas, Actions)
--
-- IMPORTANTE: Eseguire in ordine. Richiede Supabase con auth.users abilitato.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENUM TYPES
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE workspace_role AS ENUM ('owner', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE impact_source_type AS ENUM (
    'decision',
    'incident',
    'audit',
    'requirement',
    'organizational',
    'technical',
    'near_miss'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE area_state AS ENUM ('to_review', 'impacted', 'not_impacted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE action_status AS ENUM ('open', 'done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 2. AUTH & WORKSPACE TABLES
-- -----------------------------------------------------------------------------

-- 2.1 profiles (profilo utente, 1:1 con auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2.2 workspace
CREATE TABLE IF NOT EXISTS workspace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 workspace_member (relazione N:M utente-workspace)
CREATE TABLE IF NOT EXISTS workspace_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wm_workspace ON workspace_member(workspace_id);
CREATE INDEX IF NOT EXISTS idx_wm_user ON workspace_member(user_id);

-- 2.4 workspace_invitation (inviti pendenti)
CREATE TABLE IF NOT EXISTS workspace_invitation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role workspace_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  UNIQUE (workspace_id, email)
);

CREATE INDEX IF NOT EXISTS idx_inv_email ON workspace_invitation(email);
CREATE INDEX IF NOT EXISTS idx_inv_workspace ON workspace_invitation(workspace_id);
CREATE INDEX IF NOT EXISTS idx_inv_status ON workspace_invitation(status) WHERE status = 'pending';

-- -----------------------------------------------------------------------------
-- 3. IMPACT TABLES (Core business logic)
-- -----------------------------------------------------------------------------

-- 3.1 impact_area (reference table - aree ISMS)
CREATE TABLE IF NOT EXISTS impact_area (
  key TEXT PRIMARY KEY,
  sort_order INT NOT NULL
);

-- Seed delle 7 aree ISMS
INSERT INTO impact_area (key, sort_order) VALUES
  ('asset_tools', 1),
  ('information_data', 2),
  ('access_privileges', 3),
  ('process_controls', 4),
  ('risk_impact', 5),
  ('policies_docs', 6),
  ('people_awareness', 7)
ON CONFLICT (key) DO NOTHING;

-- 3.2 impact (oggetto core)
CREATE TABLE IF NOT EXISTS impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source_type impact_source_type,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ  -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_impact_workspace ON impact(workspace_id);
CREATE INDEX IF NOT EXISTS idx_impact_created_by ON impact(created_by);
CREATE INDEX IF NOT EXISTS idx_impact_created_at ON impact(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impact_archived ON impact(archived_at) WHERE archived_at IS NULL;

-- 3.3 impact_area_state (stato di ogni area per ogni impact)
CREATE TABLE IF NOT EXISTS impact_area_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impact_id UUID NOT NULL REFERENCES impact(id) ON DELETE CASCADE,
  area_key TEXT NOT NULL REFERENCES impact_area(key) ON DELETE RESTRICT,
  state area_state NOT NULL DEFAULT 'to_review',
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (impact_id, area_key)
);

CREATE INDEX IF NOT EXISTS idx_ias_impact ON impact_area_state(impact_id);

-- 3.4 impact_action (azioni da completare)
CREATE TABLE IF NOT EXISTS impact_action (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impact_id UUID NOT NULL REFERENCES impact(id) ON DELETE CASCADE,
  area_key TEXT REFERENCES impact_area(key) ON DELETE SET NULL,  -- nullable per azioni globali
  description TEXT NOT NULL,
  owner UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  status action_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_action_impact ON impact_action(impact_id);
CREATE INDEX IF NOT EXISTS idx_action_status ON impact_action(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_action_owner ON impact_action(owner);
CREATE INDEX IF NOT EXISTS idx_action_impact_status ON impact_action(impact_id, status);

-- 3.5 impact_reference (link a risorse esterne)
CREATE TABLE IF NOT EXISTS impact_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impact_id UUID NOT NULL REFERENCES impact(id) ON DELETE CASCADE,
  area_key TEXT REFERENCES impact_area(key) ON DELETE SET NULL,
  label TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ref_impact ON impact_reference(impact_id);

-- -----------------------------------------------------------------------------
-- 4. TRIGGER: Auto-creazione profile + workspace al signup
-- -----------------------------------------------------------------------------
-- IMPORTANTE: Usa sempre public.* per riferirsi alle tabelle perché il trigger
-- è chiamato nel contesto auth schema, non public

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  inv_id UUID;
  inv_workspace_id UUID;
  inv_role public.workspace_role;
  new_workspace_id UUID;
  has_accepted_any BOOLEAN := FALSE;
BEGIN
  -- 1. Crea sempre il profile (schema esplicito)
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );

  -- 2. Processa TUTTI gli inviti pendenti per questa email
  FOR inv_id, inv_workspace_id, inv_role IN
    SELECT wi.id, wi.workspace_id, wi.role
    FROM public.workspace_invitation wi
    WHERE wi.email = NEW.email
      AND wi.status = 'pending'
      AND wi.expires_at > now()
    ORDER BY wi.created_at ASC
  LOOP
    -- Aggiungi al workspace
    INSERT INTO public.workspace_member (workspace_id, user_id, role)
    VALUES (inv_workspace_id, NEW.id, inv_role)
    ON CONFLICT (workspace_id, user_id) DO NOTHING;

    -- Segna invito come accettato
    UPDATE public.workspace_invitation
    SET status = 'accepted', accepted_at = now()
    WHERE id = inv_id;

    has_accepted_any := TRUE;
  END LOOP;

  -- 3. Se nessun invito accettato, crea nuovo workspace
  IF NOT has_accepted_any THEN
    INSERT INTO public.workspace (name, created_by)
    VALUES ('Il mio workspace', NEW.id)
    RETURNING id INTO new_workspace_id;

    INSERT INTO public.workspace_member (workspace_id, user_id, role)
    VALUES (new_workspace_id, NEW.id, 'owner');
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user_signup error: % %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop e ricrea il trigger per evitare duplicati
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- -----------------------------------------------------------------------------
-- 5. RPC FUNCTIONS (SECURITY DEFINER - bypass RLS)
-- -----------------------------------------------------------------------------

-- 5.1 Crea workspace manualmente
CREATE OR REPLACE FUNCTION create_workspace(workspace_name TEXT)
RETURNS UUID AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Verifica autenticazione
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO workspace (name, created_by)
  VALUES (workspace_name, auth.uid())
  RETURNING id INTO new_workspace_id;

  INSERT INTO workspace_member (workspace_id, user_id, role)
  VALUES (new_workspace_id, auth.uid(), 'owner');

  RETURN new_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 Invia invito (solo owner può invitare)
CREATE OR REPLACE FUNCTION send_workspace_invitation(
  p_workspace_id UUID,
  p_email TEXT,
  p_role workspace_role DEFAULT 'member'
)
RETURNS UUID AS $$
DECLARE
  invitation_id UUID;
BEGIN
  -- Verifica che l'utente sia owner del workspace
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only workspace owners can send invitations';
  END IF;

  -- Verifica che l'email non sia già membro
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

-- 5.3 Accetta invito (per utenti già registrati)
CREATE OR REPLACE FUNCTION accept_workspace_invitation(p_invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  inv workspace_invitation%ROWTYPE;
BEGIN
  -- Trova l'invito
  SELECT * INTO inv
  FROM workspace_invitation
  WHERE id = p_invitation_id
    AND status = 'pending'
    AND expires_at > now();

  IF inv IS NULL THEN
    RAISE EXCEPTION 'Invitation not found, expired, or already used';
  END IF;

  -- Verifica che l'email corrisponda
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND email = inv.email
  ) THEN
    RAISE EXCEPTION 'This invitation is for a different email address';
  END IF;

  -- Aggiungi al workspace
  INSERT INTO workspace_member (workspace_id, user_id, role)
  VALUES (inv.workspace_id, auth.uid(), inv.role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Segna come accettato
  UPDATE workspace_invitation
  SET status = 'accepted', accepted_at = now()
  WHERE id = p_invitation_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.4 Lista workspace dell'utente con conteggi
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
    (SELECT COUNT(*) FROM workspace_member WHERE workspace_id = w.id) as member_count,
    w.created_at
  FROM workspace w
  JOIN workspace_member wm ON wm.workspace_id = w.id
  WHERE wm.user_id = auth.uid()
  ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.5 Lista impacts del workspace con conteggi aggregati (include dati creatore per GDPR compliance)
CREATE OR REPLACE FUNCTION get_workspace_impacts(ws_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  source_type impact_source_type,
  status TEXT,
  created_by UUID,
  created_by_email TEXT,
  created_by_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  areas_to_review BIGINT,
  areas_impacted BIGINT,
  areas_not_impacted BIGINT,
  actions_open BIGINT,
  actions_done BIGINT
) AS $$
BEGIN
  -- Verifica accesso al workspace
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to this workspace';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.title,
    i.description,
    i.source_type,
    -- Calculated status: draft -> actions_open -> closed
    CASE
      WHEN COUNT(*) FILTER (WHERE ias.state = 'to_review') > 0 THEN 'draft'
      WHEN (SELECT COUNT(*) FROM impact_action ia WHERE ia.impact_id = i.id AND ia.status = 'open') > 0 THEN 'actions_open'
      ELSE 'closed'
    END::TEXT as status,
    i.created_by,
    p.email as created_by_email,
    p.display_name as created_by_name,
    i.created_at,
    i.updated_at,
    COUNT(*) FILTER (WHERE ias.state = 'to_review') as areas_to_review,
    COUNT(*) FILTER (WHERE ias.state = 'impacted') as areas_impacted,
    COUNT(*) FILTER (WHERE ias.state = 'not_impacted') as areas_not_impacted,
    (SELECT COUNT(*) FROM impact_action ia WHERE ia.impact_id = i.id AND ia.status = 'open') as actions_open,
    (SELECT COUNT(*) FROM impact_action ia WHERE ia.impact_id = i.id AND ia.status = 'done') as actions_done
  FROM impact i
  JOIN profiles p ON p.id = i.created_by
  LEFT JOIN impact_area_state ias ON ias.impact_id = i.id
  WHERE i.workspace_id = ws_id
    AND i.archived_at IS NULL
  GROUP BY i.id, p.email, p.display_name
  ORDER BY i.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.6 Crea impact con stati area inizializzati
CREATE OR REPLACE FUNCTION create_impact(
  ws_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_source_type impact_source_type DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_impact_id UUID;
  area RECORD;
BEGIN
  -- Verifica accesso al workspace
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to this workspace';
  END IF;

  -- Crea impact
  INSERT INTO impact (workspace_id, title, description, source_type, created_by)
  VALUES (ws_id, p_title, p_description, p_source_type, auth.uid())
  RETURNING id INTO new_impact_id;

  -- Crea stati area iniziali (tutti to_review)
  FOR area IN SELECT key FROM impact_area ORDER BY sort_order LOOP
    INSERT INTO impact_area_state (impact_id, area_key, state, updated_by)
    VALUES (new_impact_id, area.key, 'to_review', auth.uid());
  END LOOP;

  RETURN new_impact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.7 Ottieni dettaglio singolo impact (include dati creatore per GDPR compliance)
CREATE OR REPLACE FUNCTION get_impact_detail(p_impact_id UUID)
RETURNS TABLE (
  id UUID,
  workspace_id UUID,
  title TEXT,
  description TEXT,
  source_type impact_source_type,
  status TEXT,
  created_by UUID,
  created_by_email TEXT,
  created_by_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  areas_to_review_count BIGINT;
  actions_open_count BIGINT;
  calculated_status TEXT;
BEGIN
  -- Verifica accesso all'impact tramite workspace
  IF NOT EXISTS (
    SELECT 1 FROM impact i
    JOIN workspace_member wm ON wm.workspace_id = i.workspace_id
    WHERE i.id = p_impact_id
      AND wm.user_id = auth.uid()
      AND i.archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Impact not found or access denied';
  END IF;

  -- Calculate counts for status
  SELECT COUNT(*) INTO areas_to_review_count
  FROM impact_area_state
  WHERE impact_id = p_impact_id AND state = 'to_review';

  SELECT COUNT(*) INTO actions_open_count
  FROM impact_action ia
  WHERE ia.impact_id = p_impact_id AND ia.status = 'open';

  -- Calculate status: draft -> actions_open -> closed
  IF areas_to_review_count > 0 THEN
    calculated_status := 'draft';
  ELSIF actions_open_count > 0 THEN
    calculated_status := 'actions_open';
  ELSE
    calculated_status := 'closed';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.workspace_id,
    i.title,
    i.description,
    i.source_type,
    calculated_status,
    i.created_by,
    p.email as created_by_email,
    p.display_name as created_by_name,
    i.created_at,
    i.updated_at
  FROM impact i
  JOIN profiles p ON p.id = i.created_by
  WHERE i.id = p_impact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.8 Aggiorna stato di un'area
CREATE OR REPLACE FUNCTION update_area_state(
  p_impact_id UUID,
  p_area_key TEXT,
  p_state area_state,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica accesso all'impact tramite workspace
  IF NOT EXISTS (
    SELECT 1 FROM impact i
    JOIN workspace_member wm ON wm.workspace_id = i.workspace_id
    WHERE i.id = p_impact_id
      AND wm.user_id = auth.uid()
      AND i.archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Impact not found or access denied';
  END IF;

  UPDATE impact_area_state
  SET state = p_state,
      notes = COALESCE(p_notes, notes),
      updated_by = auth.uid(),
      updated_at = now()
  WHERE impact_id = p_impact_id
    AND area_key = p_area_key;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.9 Lista membri del workspace (bypassa RLS per evitare ricorsione)
CREATE OR REPLACE FUNCTION get_workspace_members(p_workspace_id UUID)
RETURNS TABLE (
  user_id UUID,
  role workspace_role,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Verifica accesso al workspace
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member wm_check
    WHERE wm_check.workspace_id = p_workspace_id AND wm_check.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to this workspace';
  END IF;

  RETURN QUERY
  SELECT
    wm.user_id,
    wm.role,
    p.email,
    p.display_name,
    p.avatar_url,
    wm.created_at as joined_at
  FROM workspace_member wm
  JOIN profiles p ON p.id = wm.user_id
  WHERE wm.workspace_id = p_workspace_id
  ORDER BY wm.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.10 Rimuovi membro dal workspace (solo owner)
CREATE OR REPLACE FUNCTION remove_workspace_member(
  p_workspace_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Solo owner può rimuovere
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only owners can remove members';
  END IF;

  -- Non può rimuovere se stesso se è l'unico owner
  IF p_user_id = auth.uid() AND NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id
      AND role = 'owner'
      AND user_id != auth.uid()
  ) THEN
    RAISE EXCEPTION 'Cannot remove the last owner';
  END IF;

  DELETE FROM workspace_member
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.11 Archivia impact (soft delete)
CREATE OR REPLACE FUNCTION archive_impact(p_impact_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica accesso all'impact tramite workspace
  IF NOT EXISTS (
    SELECT 1 FROM impact i
    JOIN workspace_member wm ON wm.workspace_id = i.workspace_id
    WHERE i.id = p_impact_id
      AND wm.user_id = auth.uid()
      AND i.archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Impact not found or access denied';
  END IF;

  UPDATE impact SET archived_at = now() WHERE id = p_impact_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.12 Aggiorna impact (title, description, source_type)
CREATE OR REPLACE FUNCTION update_impact(
  p_impact_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_source_type impact_source_type DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica accesso all'impact tramite workspace
  IF NOT EXISTS (
    SELECT 1 FROM impact i
    JOIN workspace_member wm ON wm.workspace_id = i.workspace_id
    WHERE i.id = p_impact_id
      AND wm.user_id = auth.uid()
      AND i.archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Impact not found or access denied';
  END IF;

  UPDATE impact SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    source_type = COALESCE(p_source_type, source_type)
  WHERE id = p_impact_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.13 Annulla invito (solo owner)
CREATE OR REPLACE FUNCTION cancel_workspace_invitation(p_invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  inv workspace_invitation%ROWTYPE;
BEGIN
  -- Trova l'invito
  SELECT * INTO inv FROM workspace_invitation WHERE id = p_invitation_id;

  IF inv IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  -- Verifica che l'utente sia owner del workspace
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = inv.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only workspace owners can cancel invitations';
  END IF;

  -- Elimina l'invito
  DELETE FROM workspace_invitation WHERE id = p_invitation_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.14 Aggiorna ruolo membro (solo owner)
CREATE OR REPLACE FUNCTION update_member_role(
  p_workspace_id UUID,
  p_user_id UUID,
  p_new_role workspace_role
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica che l'utente corrente sia owner
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only owners can change member roles';
  END IF;

  -- Non può declassare se stesso se è l'unico owner
  IF p_user_id = auth.uid() AND p_new_role = 'member' THEN
    IF NOT EXISTS (
      SELECT 1 FROM workspace_member
      WHERE workspace_id = p_workspace_id
        AND role = 'owner'
        AND user_id != auth.uid()
    ) THEN
      RAISE EXCEPTION 'Cannot demote yourself as the last owner';
    END IF;
  END IF;

  -- Aggiorna il ruolo
  UPDATE workspace_member
  SET role = p_new_role
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.15 Elimina workspace (solo owner, con cascade)
CREATE OR REPLACE FUNCTION delete_workspace(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica che l'utente sia owner
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only owners can delete workspaces';
  END IF;

  -- Elimina il workspace (cascade elimina members, invitations, impacts, etc.)
  DELETE FROM workspace WHERE id = p_workspace_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.16 Lista inviti pendenti del workspace (solo owner)
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
BEGIN
  -- Verifica accesso al workspace (owner per vedere inviti)
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only owners can view pending invitations';
  END IF;

  RETURN QUERY
  SELECT
    wi.id,
    wi.email,
    wi.role,
    wi.invited_by,
    p.email as invited_by_email,
    p.display_name as invited_by_name,
    wi.created_at,
    wi.expires_at
  FROM workspace_invitation wi
  JOIN profiles p ON p.id = wi.invited_by
  WHERE wi.workspace_id = p_workspace_id
    AND wi.status = 'pending'
    AND wi.expires_at > now()
  ORDER BY wi.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.17 Rinomina workspace (solo owner)
CREATE OR REPLACE FUNCTION rename_workspace(
  p_workspace_id UUID,
  p_new_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica che l'utente sia owner
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only owners can rename workspaces';
  END IF;

  -- Valida nome
  IF p_new_name IS NULL OR trim(p_new_name) = '' THEN
    RAISE EXCEPTION 'Workspace name cannot be empty';
  END IF;

  UPDATE workspace SET name = trim(p_new_name) WHERE id = p_workspace_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.18 Abbandona workspace
CREATE OR REPLACE FUNCTION leave_workspace(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica che l'utente sia membro
  IF NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You are not a member of this workspace';
  END IF;

  -- Non può lasciare se è l'unico owner
  IF EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
  ) AND NOT EXISTS (
    SELECT 1 FROM workspace_member
    WHERE workspace_id = p_workspace_id
      AND role = 'owner'
      AND user_id != auth.uid()
  ) THEN
    RAISE EXCEPTION 'Cannot leave as the last owner. Transfer ownership first or delete the workspace.';
  END IF;

  DELETE FROM workspace_member
  WHERE workspace_id = p_workspace_id AND user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.19 Accetta inviti pendenti (per utenti già esistenti che fanno login)
CREATE OR REPLACE FUNCTION accept_pending_invitations()
RETURNS INTEGER AS $$
DECLARE
  inv RECORD;
  accepted_count INTEGER := 0;
  user_email TEXT;
BEGIN
  -- Get current user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

  IF user_email IS NULL THEN
    RETURN 0;
  END IF;

  -- Process all pending invitations for this email
  FOR inv IN
    SELECT wi.id, wi.workspace_id, wi.role
    FROM workspace_invitation wi
    WHERE wi.email = user_email
      AND wi.status = 'pending'
      AND wi.expires_at > now()
    ORDER BY wi.created_at ASC
  LOOP
    -- Add to workspace
    INSERT INTO workspace_member (workspace_id, user_id, role)
    VALUES (inv.workspace_id, auth.uid(), inv.role)
    ON CONFLICT (workspace_id, user_id) DO NOTHING;

    -- Mark invitation as accepted
    UPDATE workspace_invitation
    SET status = 'accepted', accepted_at = now()
    WHERE id = inv.id;

    accepted_count := accepted_count + 1;
  END LOOP;

  RETURN accepted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 5.12 PROFILE MANAGEMENT
-- =============================================================================

-- Funzione RPC per aggiornare il profilo utente
CREATE OR REPLACE FUNCTION update_profile(p_display_name TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET
    display_name = COALESCE(NULLIF(TRIM(p_display_name), ''), display_name),
    updated_at = now()
  WHERE id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere il profilo corrente
CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.display_name,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitation ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_area ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_area_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_action ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_reference ENABLE ROW LEVEL SECURITY;

-- 6.1 profiles: vedi SOLO te stesso (GDPR - dati non segregati per workspace)
-- Per ottenere dati di altri utenti, usa RPC functions che restituiscono solo dati necessari
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  id = auth.uid()
);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 6.2 workspace: vedi solo i tuoi workspace
DROP POLICY IF EXISTS "workspace_select" ON workspace;
CREATE POLICY "workspace_select" ON workspace FOR SELECT USING (
  id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
);

-- Solo owner può aggiornare il workspace (es. rinominare)
DROP POLICY IF EXISTS "workspace_update" ON workspace;
CREATE POLICY "workspace_update" ON workspace FOR UPDATE
  USING (
    id IN (
      SELECT workspace_id FROM workspace_member
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT workspace_id FROM workspace_member
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- 6.3 workspace_member: vedi solo le tue membership (evita ricorsione RLS)
-- Per vedere altri membri usa RPC get_workspace_members()
DROP POLICY IF EXISTS "workspace_member_select" ON workspace_member;
CREATE POLICY "workspace_member_select" ON workspace_member FOR SELECT USING (
  user_id = auth.uid()
);

-- 6.4 workspace_invitation: owner vede inviti del suo workspace, invitato vede i suoi
DROP POLICY IF EXISTS "invitation_select" ON workspace_invitation;
CREATE POLICY "invitation_select" ON workspace_invitation FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_member
    WHERE user_id = auth.uid() AND role = 'owner'
  )
  OR email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- 6.5 impact_area: reference table read-only per utenti autenticati
DROP POLICY IF EXISTS "impact_area_select" ON impact_area;
CREATE POLICY "impact_area_select" ON impact_area FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 6.6 impact: vedi solo impacts del tuo workspace (escludi archiviati)
DROP POLICY IF EXISTS "impact_select" ON impact;
CREATE POLICY "impact_select" ON impact FOR SELECT USING (
  workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
  AND archived_at IS NULL
);

DROP POLICY IF EXISTS "impact_insert" ON impact;
CREATE POLICY "impact_insert" ON impact FOR INSERT WITH CHECK (
  workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "impact_update" ON impact;
CREATE POLICY "impact_update" ON impact FOR UPDATE
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
  )
  WITH CHECK (
    workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
  );

-- Solo owner del workspace può eliminare impact (hard delete)
DROP POLICY IF EXISTS "impact_delete" ON impact;
CREATE POLICY "impact_delete" ON impact FOR DELETE USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_member
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- 6.7 impact_area_state: accesso tramite impact (escludi archiviati)
DROP POLICY IF EXISTS "impact_area_state_select" ON impact_area_state;
CREATE POLICY "impact_area_state_select" ON impact_area_state FOR SELECT USING (
  impact_id IN (
    SELECT id FROM impact
    WHERE workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
      AND archived_at IS NULL
  )
);

DROP POLICY IF EXISTS "impact_area_state_insert" ON impact_area_state;
CREATE POLICY "impact_area_state_insert" ON impact_area_state FOR INSERT WITH CHECK (
  impact_id IN (
    SELECT id FROM impact
    WHERE workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
      AND archived_at IS NULL
  )
  AND updated_by = auth.uid()
);

DROP POLICY IF EXISTS "impact_area_state_update" ON impact_area_state;
CREATE POLICY "impact_area_state_update" ON impact_area_state FOR UPDATE
  USING (
    impact_id IN (
      SELECT id FROM impact
      WHERE workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
        AND archived_at IS NULL
    )
  )
  WITH CHECK (
    impact_id IN (
      SELECT id FROM impact
      WHERE workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
        AND archived_at IS NULL
    )
    AND updated_by = auth.uid()
  );

-- 6.8 impact_action: accesso tramite impact (escludi archiviati), owner deve essere membro
DROP POLICY IF EXISTS "impact_action_all" ON impact_action;
CREATE POLICY "impact_action_all" ON impact_action FOR ALL
  USING (
    impact_id IN (
      SELECT id FROM impact
      WHERE workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
        AND archived_at IS NULL
    )
  )
  WITH CHECK (
    impact_id IN (
      SELECT id FROM impact
      WHERE workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
        AND archived_at IS NULL
    )
    AND (owner IS NULL OR owner IN (
      SELECT wm.user_id FROM workspace_member wm
      JOIN impact i ON i.workspace_id = wm.workspace_id
      WHERE i.id = impact_id
    ))
  );

-- 6.9 impact_reference: accesso tramite impact (escludi archiviati)
DROP POLICY IF EXISTS "impact_reference_all" ON impact_reference;
CREATE POLICY "impact_reference_all" ON impact_reference FOR ALL
  USING (
    impact_id IN (
      SELECT id FROM impact
      WHERE workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
        AND archived_at IS NULL
    )
  )
  WITH CHECK (
    impact_id IN (
      SELECT id FROM impact
      WHERE workspace_id IN (SELECT workspace_id FROM workspace_member WHERE user_id = auth.uid())
        AND archived_at IS NULL
    )
  );

-- -----------------------------------------------------------------------------
-- 7. UTILITY: Updated_at trigger
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS impact_updated_at ON impact;
CREATE TRIGGER impact_updated_at
  BEFORE UPDATE ON impact
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS impact_area_state_updated_at ON impact_area_state;
CREATE TRIGGER impact_area_state_updated_at
  BEFORE UPDATE ON impact_area_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- 8. TRIGGER: Touch impact.updated_at su modifiche a entita collegate
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION touch_impact_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE impact SET updated_at = now()
  WHERE id = COALESCE(NEW.impact_id, OLD.impact_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_touch_impact_from_area_state ON impact_area_state;
CREATE TRIGGER trg_touch_impact_from_area_state
  AFTER INSERT OR UPDATE OR DELETE ON impact_area_state
  FOR EACH ROW EXECUTE FUNCTION touch_impact_updated_at();

DROP TRIGGER IF EXISTS trg_touch_impact_from_action ON impact_action;
CREATE TRIGGER trg_touch_impact_from_action
  AFTER INSERT OR UPDATE OR DELETE ON impact_action
  FOR EACH ROW EXECUTE FUNCTION touch_impact_updated_at();

DROP TRIGGER IF EXISTS trg_touch_impact_from_reference ON impact_reference;
CREATE TRIGGER trg_touch_impact_from_reference
  AFTER INSERT OR UPDATE OR DELETE ON impact_reference
  FOR EACH ROW EXECUTE FUNCTION touch_impact_updated_at();
