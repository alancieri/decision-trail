-- =============================================================================
-- B1: Extend create_impact RPC with AI parameters
-- =============================================================================
-- Adds p_ai_context and p_ai_generated parameters to create_impact function

CREATE OR REPLACE FUNCTION create_impact(
  ws_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_source_type impact_source_type DEFAULT NULL,
  p_ai_context TEXT DEFAULT NULL,
  p_ai_generated BOOLEAN DEFAULT false
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

  -- Crea impact with AI fields
  INSERT INTO impact (workspace_id, title, description, source_type, created_by, ai_context, ai_generated)
  VALUES (ws_id, p_title, p_description, p_source_type, auth.uid(), p_ai_context, p_ai_generated)
  RETURNING id INTO new_impact_id;

  -- Crea stati area iniziali (tutti to_review)
  FOR area IN SELECT key FROM impact_area ORDER BY sort_order LOOP
    INSERT INTO impact_area_state (impact_id, area_key, state, updated_by)
    VALUES (new_impact_id, area.key, 'to_review', auth.uid());
  END LOOP;

  RETURN new_impact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
