-- =============================================================================
-- B1: Extend read RPCs to include AI fields
-- =============================================================================
-- Updates get_workspace_impacts and get_impact_detail to return ai_context and ai_generated
-- NOTE: DROP is required because we're changing the return type (adding columns)

-- 1. Update get_workspace_impacts to include AI fields
DROP FUNCTION IF EXISTS get_workspace_impacts(UUID);
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
  actions_done BIGINT,
  ai_context TEXT,
  ai_generated BOOLEAN
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
    p.full_name as created_by_name,
    i.created_at,
    i.updated_at,
    COUNT(*) FILTER (WHERE ias.state = 'to_review') as areas_to_review,
    COUNT(*) FILTER (WHERE ias.state = 'impacted') as areas_impacted,
    COUNT(*) FILTER (WHERE ias.state = 'not_impacted') as areas_not_impacted,
    (SELECT COUNT(*) FROM impact_action ia WHERE ia.impact_id = i.id AND ia.status = 'open') as actions_open,
    (SELECT COUNT(*) FROM impact_action ia WHERE ia.impact_id = i.id AND ia.status = 'done') as actions_done,
    i.ai_context,
    i.ai_generated
  FROM impact i
  JOIN profiles p ON p.id = i.created_by
  LEFT JOIN impact_area_state ias ON ias.impact_id = i.id
  WHERE i.workspace_id = ws_id
    AND i.archived_at IS NULL
  GROUP BY i.id, p.email, p.full_name
  ORDER BY i.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update get_impact_detail to include AI fields
DROP FUNCTION IF EXISTS get_impact_detail(UUID);
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
  updated_at TIMESTAMPTZ,
  ai_context TEXT,
  ai_generated BOOLEAN
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
    p.full_name as created_by_name,
    i.created_at,
    i.updated_at,
    i.ai_context,
    i.ai_generated
  FROM impact i
  JOIN profiles p ON p.id = i.created_by
  WHERE i.id = p_impact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
