-- =============================================================================
-- Migrazione: Aggiorna RPC per usare display_name
-- =============================================================================
-- Aggiorna le funzioni RPC che usavano full_name per usare display_name.
-- Necessario DROP + CREATE perché il return type cambia (full_name → display_name)
-- =============================================================================

-- Drop e ricrea get_workspace_members
DROP FUNCTION IF EXISTS get_workspace_members(UUID);
CREATE FUNCTION get_workspace_members(p_workspace_id UUID)
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

-- Drop e ricrea get_workspace_pending_invitations
DROP FUNCTION IF EXISTS get_workspace_pending_invitations(UUID);
CREATE FUNCTION get_workspace_pending_invitations(p_workspace_id UUID)
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

-- Drop e ricrea get_workspace_impacts
DROP FUNCTION IF EXISTS get_workspace_impacts(UUID);
CREATE FUNCTION get_workspace_impacts(ws_id UUID)
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
    SELECT 1 FROM workspace_member wm
    WHERE wm.workspace_id = ws_id AND wm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to this workspace';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.title,
    i.description,
    i.source_type,
    CASE
      WHEN i.archived_at IS NOT NULL THEN 'archived'
      WHEN (SELECT COUNT(*) FROM impact_action ia WHERE ia.impact_id = i.id AND ia.status = 'open') > 0 THEN 'actions_open'
      WHEN (SELECT COUNT(*) FROM impact_area_state ias WHERE ias.impact_id = i.id AND ias.state != 'to_review') = 7 THEN 'assessed'
      ELSE 'draft'
    END as status,
    i.created_by,
    p.email as created_by_email,
    p.display_name as created_by_name,
    i.created_at,
    i.updated_at,
    (SELECT COUNT(*) FROM impact_area_state ias WHERE ias.impact_id = i.id AND ias.state = 'to_review') as areas_to_review,
    (SELECT COUNT(*) FROM impact_area_state ias WHERE ias.impact_id = i.id AND ias.state = 'impacted') as areas_impacted,
    (SELECT COUNT(*) FROM impact_area_state ias WHERE ias.impact_id = i.id AND ias.state = 'not_impacted') as areas_not_impacted,
    (SELECT COUNT(*) FROM impact_action ia WHERE ia.impact_id = i.id AND ia.status = 'open') as actions_open,
    (SELECT COUNT(*) FROM impact_action ia WHERE ia.impact_id = i.id AND ia.status = 'done') as actions_done
  FROM impact i
  JOIN profiles p ON p.id = i.created_by
  WHERE i.workspace_id = ws_id
    AND i.archived_at IS NULL
  ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop e ricrea get_impact_detail
DROP FUNCTION IF EXISTS get_impact_detail(UUID);
CREATE FUNCTION get_impact_detail(p_impact_id UUID)
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
  workspace_id UUID
) AS $$
BEGIN
  -- Verifica accesso tramite workspace membership
  IF NOT EXISTS (
    SELECT 1 FROM impact i
    JOIN workspace_member wm ON wm.workspace_id = i.workspace_id
    WHERE i.id = p_impact_id AND wm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to this impact';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.title,
    i.description,
    i.source_type,
    CASE
      WHEN i.archived_at IS NOT NULL THEN 'archived'
      WHEN (SELECT COUNT(*) FROM impact_action ia WHERE ia.impact_id = i.id AND ia.status = 'open') > 0 THEN 'actions_open'
      WHEN (SELECT COUNT(*) FROM impact_area_state ias WHERE ias.impact_id = i.id AND ias.state != 'to_review') = 7 THEN 'assessed'
      ELSE 'draft'
    END as status,
    i.created_by,
    p.email as created_by_email,
    p.display_name as created_by_name,
    i.created_at,
    i.updated_at,
    i.workspace_id
  FROM impact i
  JOIN profiles p ON p.id = i.created_by
  WHERE i.id = p_impact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
