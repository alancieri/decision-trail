// =============================================================================
// AI Types for Decision Trail
// =============================================================================
// Types for the impact-assist Edge Function and AI-related functionality

import type { Database } from "./database";

// Area state type from database
export type AreaState = Database["public"]["Enums"]["area_state"];

// ISMS Area keys
export type AreaKey =
  | "asset_tools"
  | "information_data"
  | "access_privileges"
  | "process_controls"
  | "risk_impact"
  | "policies_docs"
  | "people_awareness";

// All area keys as const array for iteration
export const AREA_KEYS: readonly AreaKey[] = [
  "asset_tools",
  "information_data",
  "access_privileges",
  "process_controls",
  "risk_impact",
  "policies_docs",
  "people_awareness",
] as const;

// -----------------------------------------------------------------------------
// Impact Assist Request/Response
// -----------------------------------------------------------------------------

/**
 * Request body for POST /functions/v1/impact-assist
 */
export interface ImpactAssistRequest {
  freeText: string; // 10-5000 characters
  workspaceId: string;
}

/**
 * Area suggestions from AI - one suggestion per ISMS area
 */
export interface AreaSuggestions {
  asset_tools: AreaState;
  information_data: AreaState;
  access_privileges: AreaState;
  process_controls: AreaState;
  risk_impact: AreaState;
  policies_docs: AreaState;
  people_awareness: AreaState;
}

/**
 * A suggested action from AI
 */
export interface SuggestedAction {
  description: string;
  area_key: AreaKey | null; // null = global action
}

/**
 * Response from POST /functions/v1/impact-assist
 */
export interface ImpactAssistResponse {
  /** Concise audit-friendly title (becomes Impact title) */
  summary: string;
  /** 2-6 lines explaining how this decision affects the system */
  ai_context: string;
  /** Up to 4 questions to help user reflect on the decision */
  clarifying_questions: string[];
  /** Suggested state for each ISMS area */
  area_suggestions: AreaSuggestions;
  /** Up to 3 suggested follow-up actions */
  suggested_actions: SuggestedAction[];
}

// -----------------------------------------------------------------------------
// Impact with AI fields (extended from database type)
// -----------------------------------------------------------------------------

/**
 * Impact row with AI fields (after migration)
 */
export interface ImpactWithAI {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  source_type: Database["public"]["Enums"]["impact_source_type"] | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  /** AI-generated context explaining impact on the system */
  ai_context: string | null;
  /** True if created with AI assistance */
  ai_generated: boolean;
}

/**
 * Result from get_workspace_impacts RPC (after migration)
 */
export interface WorkspaceImpactWithAI {
  id: string;
  title: string;
  description: string | null;
  source_type: Database["public"]["Enums"]["impact_source_type"] | null;
  status: "draft" | "actions_open" | "closed";
  created_by: string;
  created_by_email: string;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  areas_to_review: number;
  areas_impacted: number;
  areas_not_impacted: number;
  actions_open: number;
  actions_done: number;
  ai_context: string | null;
  ai_generated: boolean;
}

/**
 * Result from get_impact_detail RPC (after migration)
 */
export interface ImpactDetailWithAI {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  source_type: Database["public"]["Enums"]["impact_source_type"] | null;
  status: "draft" | "actions_open" | "closed";
  created_by: string;
  created_by_email: string;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  ai_context: string | null;
  ai_generated: boolean;
}

// -----------------------------------------------------------------------------
// UI State types for New Decision flow
// -----------------------------------------------------------------------------

/**
 * State of the New Decision workflow
 */
export type NewDecisionState =
  | "input" // User is typing
  | "processing" // AI is analyzing
  | "preview" // Showing AI results for review
  | "error" // AI call failed
  | "creating"; // Persisting to database

/**
 * Draft action in the preview state (before confirmation)
 */
export interface DraftAction {
  description: string;
  area_key: AreaKey | null;
  included: boolean; // User can uncheck to exclude
}

/**
 * Complete state for New Decision preview
 */
export interface NewDecisionPreviewState {
  /** Original user input */
  originalFreeText: string;
  /** Editable summary (becomes title) */
  summary: string;
  /** Editable AI context */
  aiContext: string;
  /** Read-only questions for reflection */
  clarifyingQuestions: string[];
  /** Draft actions user can edit/include/exclude */
  draftActions: DraftAction[];
  /** Area suggestions (read-only in preview, all shown as to_review) */
  areaSuggestions: AreaSuggestions;
}
