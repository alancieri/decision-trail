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

interface AreaSuggestion {
  asset_tools: "to_review" | "impacted" | "not_impacted";
  information_data: "to_review" | "impacted" | "not_impacted";
  access_privileges: "to_review" | "impacted" | "not_impacted";
  process_controls: "to_review" | "impacted" | "not_impacted";
  risk_impact: "to_review" | "impacted" | "not_impacted";
  policies_docs: "to_review" | "impacted" | "not_impacted";
  people_awareness: "to_review" | "impacted" | "not_impacted";
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

const SYSTEM_PROMPT = `You are an ISMS (Information Security Management System) expert assistant.
Your role is to help users understand the potential impact of decisions, changes, or incidents on their organization's information security posture.

When analyzing a decision or change, you should:
1. Create a concise, audit-friendly summary (title) that captures the essence of the decision
2. Provide context about how this decision might affect the organization's security posture (2-6 lines)
3. Generate 2-4 clarifying questions that would help better assess the impact
4. Suggest which ISMS areas might be impacted (use "to_review" for areas that need human assessment, "impacted" for clearly affected areas, "not_impacted" for areas clearly not affected)
5. Suggest up to 3 concrete follow-up actions

The 7 ISMS areas are:
- asset_tools: IT assets, software, hardware, tools
- information_data: Data types, classification, backup, retention, transfers
- access_privileges: Access rights, permissions, authentication, authorization
- process_controls: Operational processes, change management, incident response, continuity
- risk_impact: Risk profile, risk assessment
- policies_docs: Policies, procedures, guidelines, documentation
- people_awareness: Training, roles, responsibilities, communication

Always respond in the same language as the input. Be concise but thorough.`;

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
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze the following decision/change and provide a structured ISMS impact assessment. Respond with a JSON object matching this structure:
{
  "summary": "Concise audit-friendly title (max 100 chars)",
  "ai_context": "2-6 lines explaining how this affects the system",
  "clarifying_questions": ["question1", "question2", ...], // max 4
  "area_suggestions": {
    "asset_tools": "to_review|impacted|not_impacted",
    "information_data": "to_review|impacted|not_impacted",
    "access_privileges": "to_review|impacted|not_impacted",
    "process_controls": "to_review|impacted|not_impacted",
    "risk_impact": "to_review|impacted|not_impacted",
    "policies_docs": "to_review|impacted|not_impacted",
    "people_awareness": "to_review|impacted|not_impacted"
  },
  "suggested_actions": [
    { "description": "Action description", "area_key": "area_key or null" }
  ] // max 3 actions
}

Decision/Change to analyze:
"""
${freeText}
"""`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
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

    // Validate and sanitize response
    const response: ImpactAssistResponse = {
      summary: (aiResult.summary || "").slice(0, 200),
      ai_context: (aiResult.ai_context || "").slice(0, 2000),
      clarifying_questions: (aiResult.clarifying_questions || []).slice(0, 4),
      area_suggestions: {
        asset_tools: aiResult.area_suggestions?.asset_tools || "to_review",
        information_data: aiResult.area_suggestions?.information_data || "to_review",
        access_privileges: aiResult.area_suggestions?.access_privileges || "to_review",
        process_controls: aiResult.area_suggestions?.process_controls || "to_review",
        risk_impact: aiResult.area_suggestions?.risk_impact || "to_review",
        policies_docs: aiResult.area_suggestions?.policies_docs || "to_review",
        people_awareness: aiResult.area_suggestions?.people_awareness || "to_review",
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
