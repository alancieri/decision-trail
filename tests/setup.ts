import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import type { Database } from "../src/types/database";

// Load environment variables from .env.local
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

/**
 * Supabase admin client with service role key.
 * Note: Due to strict RLS policies on this project, this client can call RPCs
 * but cannot directly access tables. Use RPCs for database operations.
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
