-- =============================================================================
-- Migrazione: Aggiunge campo locale al profilo utente
-- =============================================================================
-- Permette agli utenti di salvare la loro preferenza di lingua.
-- Aggiorna le RPC correlate per supportare il nuovo campo.
-- =============================================================================

-- Aggiunge campo locale al profilo utente
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'it';

-- Drop e ricrea update_profile con supporto locale
DROP FUNCTION IF EXISTS update_profile(TEXT);
CREATE FUNCTION update_profile(
  p_display_name TEXT DEFAULT NULL,
  p_locale TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET
    display_name = COALESCE(p_display_name, display_name),
    locale = COALESCE(p_locale, locale),
    updated_at = now()
  WHERE id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop e ricrea get_current_profile per includere locale
DROP FUNCTION IF EXISTS get_current_profile();
CREATE FUNCTION get_current_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  locale TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.email, p.display_name, p.avatar_url, p.locale, p.created_at, p.updated_at
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
