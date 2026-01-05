-- =============================================================================
-- Migrazione: Rinomina full_name → display_name
-- =============================================================================
-- Rinomina la colonna per chiarezza semantica.
-- Il campo rimane opzionale (nullable).
-- =============================================================================

-- Rinomina colonna in profiles
ALTER TABLE profiles RENAME COLUMN full_name TO display_name;

-- Aggiorna il trigger di signup per usare il nuovo nome colonna
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
