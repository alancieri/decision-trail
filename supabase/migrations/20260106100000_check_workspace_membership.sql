-- Migration: Add RPC to check workspace membership
-- Used by Edge Functions to verify user has access to a workspace
-- SECURITY DEFINER allows the function to bypass RLS

CREATE OR REPLACE FUNCTION check_workspace_membership(
  p_workspace_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workspace_member
    WHERE workspace_id = p_workspace_id
    AND user_id = p_user_id
  );
END;
$$;

-- Grant execute to authenticated users and anon (for edge functions)
GRANT EXECUTE ON FUNCTION check_workspace_membership(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_workspace_membership(UUID, UUID) TO anon;
