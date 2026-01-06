-- =============================================================================
-- B1: Add AI fields to impact table
-- =============================================================================
-- Adds ai_context and ai_generated columns to track AI-assisted impact creation

-- Add AI columns to impact table
ALTER TABLE impact
  ADD COLUMN IF NOT EXISTS ai_context TEXT NULL,
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT false;

-- Index for filtering AI-generated impacts
CREATE INDEX IF NOT EXISTS idx_impact_ai_generated
  ON impact(ai_generated) WHERE ai_generated = true;

-- Add comment for documentation
COMMENT ON COLUMN impact.ai_context IS 'AI-generated context explaining how this decision affects the system (2-6 lines)';
COMMENT ON COLUMN impact.ai_generated IS 'True if this impact was created with AI assistance';
