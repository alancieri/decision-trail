// =============================================================================
// Edge Function: impact-assist
// =============================================================================
// Analyzes free-text input about a decision/change and returns structured
// ISMS impact analysis using OpenAI GPT-4-turbo.
//
// POST /functions/v1/impact-assist
// Body: { "freeText": "string (10-5000 chars)", "workspaceId": "uuid" }
//
// Returns: ImpactAssistResponse (see types below)
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ImpactAssistRequest {
  freeText: string;
  workspaceId: string;
}

// AI suggestion values (preview only, not saved to DB)
type AISuggestionValue = "not_sure" | "to_review" | "likely_impacted";

interface AreaSuggestion {
  asset_tools: AISuggestionValue;
  information_data: AISuggestionValue;
  access_privileges: AISuggestionValue;
  process_controls: AISuggestionValue;
  risk_impact: AISuggestionValue;
  policies_docs: AISuggestionValue;
  people_awareness: AISuggestionValue;
}

interface SuggestedAction {
  description: string;
  area_key: string | null;
}

interface ImpactAssistResponse {
  summary: string;
  ai_context: string;
  clarifying_questions: string[];
  area_suggestions: AreaSuggestion;
  suggested_actions: SuggestedAction[];
}

// -----------------------------------------------------------------------------
// CORS Headers
// -----------------------------------------------------------------------------

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-user-token",
};

// -----------------------------------------------------------------------------
// System Prompt
// -----------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a pragmatic tech advisor helping CTOs and engineering leads understand the operational impact of decisions and changes.

LANGUAGE:
- Write ALL JSON string values in the SAME LANGUAGE as the user's input.

ROLE & TONE:
- Direct and practical (like a senior engineer talking to peers)
- Focus on "what actually changes" and "what could break"
- Avoid compliance jargon, audit-speak, or consultant language
- Do NOT sound prescriptive or authoritative (avoid: "ensure", "guarantee", "make sure", "prestare attenzione", "assicurare")

OUTPUT RULES (STRICT):
- Return ONLY a valid JSON object (no markdown, no explanations, no extra text).
- The JSON MUST match the required schema and include all fields.
- Limits:
  - clarifying_questions: 0–4 items
  - suggested_actions: 0–3 items

SUMMARY RULES:
- Exactly ONE sentence.
- Must start with a label in the user's language:
  - Italian: "Decisione: ..." (default) or "Evento: ..." if it clearly isn't a decision.
  - English: "Decision: ..." or "Event: ..."
- Neutral, audit-friendly, no value judgment.

AI_CONTEXT RULES (CONCRETE, CTO-LIKE):
- Be specific about HOW things change and what could break.
- Focus on: access/provisioning (SSO/SCIM), data migration scope (what moves vs archive), integrations (Slack, repo, CI/CD, webhooks), logging/retention (if relevant).
- Prefer 2–6 short bullet-like sentences.
- Keep ai_context short and UI-friendly: MAX ~800 characters.
- No generic security statements.
- Avoid generic phrases like:
  - Italian: "cambiamento significativo", "perdita di informazioni se non gestito correttamente", "prestare attenzione", "assicurare/garantire"
  - English: "significant change", "data loss if not handled properly", "ensure", "make sure"
- Prefer concrete specifics when relevant:
  - migration scope: database/pagine/allegati/storico (or equivalent)
  - access & provisioning: SSO/SCIM vs local accounts, role mapping
  - integrations: Slack, repos, CI/CD, webhooks/automations
  - coexistence: old tool read-only, new tool primary

CLARIFYING QUESTIONS:
- Ask questions a CTO would naturally ask.
- No ISO jargon. No compliance-speak.

SUGGESTED ACTIONS:
- Each action is an object: { "description": string, "area_key": string | null }.
- description MUST start with an infinitive verb in the user's language.
- Actions must be actionable and specific.
- area_key can be null if the action is cross-area or uncertain.
- AREA KEY RULE (important):
  - If an action mentions integrations/workflows/automations or tools like Slack, CI/CD, webhooks, pipelines, repositories,
    then area_key MUST be "process_controls" (not "asset_tools").

THE 7 AREAS TO CONSIDER (keys are fixed):
- asset_tools: Systems, software, hardware, infrastructure
- information_data: Data flows, storage, backups, data handling
- access_privileges: Who can access what, permissions, auth, SSO/SCIM
- process_controls: Procedures, workflows, operational process changes
- risk_impact: What could go wrong, dependencies, blast radius
- policies_docs: Documentation that needs updating
- people_awareness: Training, comms, who needs to know

AREA SUGGESTIONS (SELECTIVE):
- Allowed values ONLY: "not_sure" | "to_review" | "likely_impacted"
- Use "likely_impacted" for MAX 2–3 areas that are clearly and directly affected.
- Use "to_review" for plausible impacts needing human judgment.
- Use "not_sure" when there's not enough information.
- Never mark everything as "likely_impacted".
- Heuristic:
  - If the input implies a tool/process change affecting multiple users, default people_awareness to "to_review" (not "not_sure").

REQUIRED JSON SCHEMA:
{
  "summary": "string",
  "ai_context": "string",
  "clarifying_questions": ["string"],
  "area_suggestions": {
    "asset_tools": "not_sure|to_review|likely_impacted",
    "information_data": "not_sure|to_review|likely_impacted",
    "access_privileges": "not_sure|to_review|likely_impacted",
    "process_controls": "not_sure|to_review|likely_impacted",
    "risk_impact": "not_sure|to_review|likely_impacted",
    "policies_docs": "not_sure|to_review|likely_impacted",
    "people_awareness": "not_sure|to_review|likely_impacted"
  },
  "suggested_actions": [
    { "description": "string", "area_key": "asset_tools|information_data|access_privileges|process_controls|risk_impact|policies_docs|people_awareness|null" }
  ]
}`;

// -----------------------------------------------------------------------------
// Main Handler
// -----------------------------------------------------------------------------

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // WORKAROUND: Supabase Edge Functions don't support ES256 JWT verification yet.
    // The client passes anon key in Authorization header (to bypass platform check)
    // and the actual user token in x-user-token header.
    // See: docs/notes/jwt-es256-workaround.md
    const userToken = req.headers.get("x-user-token");
    if (!userToken) {
      return new Response(
        JSON.stringify({ error: "Missing user token", code: 401 }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user token to verify authentication
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Client for auth verification and RPC calls (uses user token)
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${userToken}` } },
    });

    // Verify user authentication
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid JWT", code: 401 }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: ImpactAssistRequest = await req.json();
    const { freeText, workspaceId } = body;

    // Validate input
    if (!freeText || freeText.length < 10 || freeText.length > 5000) {
      return new Response(
        JSON.stringify({ error: "freeText must be between 10 and 5000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!workspaceId) {
      return new Response(
        JSON.stringify({ error: "workspaceId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has access to workspace using RPC (SECURITY DEFINER bypasses RLS)
    const { data: hasMembership, error: memberError } = await authClient.rpc(
      "check_workspace_membership",
      { p_workspace_id: workspaceId, p_user_id: user.id }
    );

    if (memberError || !hasMembership) {
      console.error("Membership check failed:", {
        workspaceId,
        userId: user.id,
        error: memberError?.message,
        hasMembership
      });
      return new Response(
        JSON.stringify({ error: "Access denied to this workspace" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this decision/change:

"""
${freeText}
"""`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "impact_assist",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["summary", "ai_context", "clarifying_questions", "area_suggestions", "suggested_actions"],
              properties: {
                summary: { type: "string" },
                ai_context: { type: "string" },
                clarifying_questions: {
                  type: "array",
                  items: { type: "string" },
                  maxItems: 4
                },
                area_suggestions: {
                  type: "object",
                  additionalProperties: false,
                  required: ["asset_tools", "information_data", "access_privileges", "process_controls", "risk_impact", "policies_docs", "people_awareness"],
                  properties: {
                    asset_tools: { type: "string", enum: ["not_sure", "to_review", "likely_impacted"] },
                    information_data: { type: "string", enum: ["not_sure", "to_review", "likely_impacted"] },
                    access_privileges: { type: "string", enum: ["not_sure", "to_review", "likely_impacted"] },
                    process_controls: { type: "string", enum: ["not_sure", "to_review", "likely_impacted"] },
                    risk_impact: { type: "string", enum: ["not_sure", "to_review", "likely_impacted"] },
                    policies_docs: { type: "string", enum: ["not_sure", "to_review", "likely_impacted"] },
                    people_awareness: { type: "string", enum: ["not_sure", "to_review", "likely_impacted"] }
                  }
                },
                suggested_actions: {
                  type: "array",
                  maxItems: 3,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["description", "area_key"],
                    properties: {
                      description: { type: "string" },
                      area_key: {
                        type: ["string", "null"],
                        enum: ["asset_tools", "information_data", "access_privileges", "process_controls", "risk_impact", "policies_docs", "people_awareness", null]
                      }
                    }
                  }
                }
              }
            }
          }
        },
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiResult: ImpactAssistResponse = JSON.parse(
      openaiData.choices[0].message.content
    );

    // Helper to validate AI suggestion values
    const validSuggestions: AISuggestionValue[] = ["not_sure", "to_review", "likely_impacted"];
    const validateSuggestion = (val: unknown): AISuggestionValue => {
      if (typeof val === "string" && validSuggestions.includes(val as AISuggestionValue)) {
        return val as AISuggestionValue;
      }
      return "to_review"; // fallback
    };

    // Validate and sanitize response
    const response: ImpactAssistResponse = {
      summary: (aiResult.summary || "").slice(0, 200),
      ai_context: (aiResult.ai_context || "").slice(0, 2000),
      clarifying_questions: (aiResult.clarifying_questions || []).slice(0, 4),
      area_suggestions: {
        asset_tools: validateSuggestion(aiResult.area_suggestions?.asset_tools),
        information_data: validateSuggestion(aiResult.area_suggestions?.information_data),
        access_privileges: validateSuggestion(aiResult.area_suggestions?.access_privileges),
        process_controls: validateSuggestion(aiResult.area_suggestions?.process_controls),
        risk_impact: validateSuggestion(aiResult.area_suggestions?.risk_impact),
        policies_docs: validateSuggestion(aiResult.area_suggestions?.policies_docs),
        people_awareness: validateSuggestion(aiResult.area_suggestions?.people_awareness),
      },
      suggested_actions: (aiResult.suggested_actions || []).slice(0, 3).map((action) => ({
        description: (action.description || "").slice(0, 500),
        area_key: action.area_key || null,
      })),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in impact-assist:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
