// =============================================================================
// API Client for impact-assist Edge Function
// =============================================================================

import { createClient } from "@/lib/supabase/client";
import type { ImpactAssistRequest, ImpactAssistResponse } from "@/types/ai";

/**
 * Error class for impact-assist API errors
 */
export class ImpactAssistError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ImpactAssistError";
  }
}

/**
 * Calls the impact-assist Edge Function to analyze free-text input
 *
 * @param request - The request containing freeText and workspaceId
 * @returns Promise with the AI analysis response
 * @throws ImpactAssistError on failure
 */
export async function analyzeDecision(
  request: ImpactAssistRequest
): Promise<ImpactAssistResponse> {
  const supabase = createClient();

  // First verify user is authenticated (this also refreshes the token if needed)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new ImpactAssistError("Not authenticated", 401, "UNAUTHORIZED");
  }

  // Now get the session with fresh token
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new ImpactAssistError("Session expired", 401, "SESSION_EXPIRED");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new ImpactAssistError("Supabase URL not configured", 500, "CONFIG_ERROR");
  }

  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseAnonKey) {
    throw new ImpactAssistError("Supabase anon key not configured", 500, "CONFIG_ERROR");
  }

  // WORKAROUND: Supabase Edge Functions don't support ES256 JWT verification yet.
  // We pass the anon key to bypass platform JWT check, and the user token in a custom header.
  // See: docs/notes/jwt-es256-workaround.md
  const response = await fetch(`${supabaseUrl}/functions/v1/impact-assist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      "x-user-token": session.access_token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.error || `Request failed with status ${response.status}`;

    throw new ImpactAssistError(message, response.status, errorBody.code);
  }

  const data: ImpactAssistResponse = await response.json();
  return data;
}

/**
 * Configuration for the impact-assist call
 */
export const IMPACT_ASSIST_CONFIG = {
  /** Minimum characters required for analysis */
  MIN_CHARS: 10,
  /** Maximum characters allowed */
  MAX_CHARS: 5000,
  /** Timeout for the API call in milliseconds */
  TIMEOUT_MS: 30000,
} as const;
