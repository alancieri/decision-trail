import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  analyzeDecision,
  ImpactAssistError,
  IMPACT_ASSIST_CONFIG,
} from "../../src/lib/api/impact-assist";

// Mock Supabase client
vi.mock("../../src/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  })),
}));

// Get the mocked module
import { createClient } from "../../src/lib/supabase/client";

describe("impact-assist API client", () => {
  const mockSupabaseUrl = "https://test.supabase.co";
  const mockAnonKey = "test-anon-key";
  const mockAccessToken = "test-access-token";
  const mockWorkspaceId = "test-workspace-id";

  beforeEach(() => {
    // Set env variables
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", mockSupabaseUrl);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", mockAnonKey);

    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("analyzeDecision", () => {
    it("throws ImpactAssistError when not authenticated", async () => {
      // Mock no user
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error("Not authenticated"),
          }),
          getSession: vi.fn(),
        },
      } as unknown as ReturnType<typeof createClient>);

      await expect(
        analyzeDecision({
          freeText: "Test decision",
          workspaceId: mockWorkspaceId,
        })
      ).rejects.toThrow(ImpactAssistError);

      await expect(
        analyzeDecision({
          freeText: "Test decision",
          workspaceId: mockWorkspaceId,
        })
      ).rejects.toMatchObject({
        status: 401,
        code: "UNAUTHORIZED",
      });
    });

    it("calls Edge Function with correct parameters", async () => {
      // Mock authenticated user and session
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "test-user-id" } },
            error: null,
          }),
          getSession: vi.fn().mockResolvedValue({
            data: {
              session: { access_token: mockAccessToken },
            },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createClient>);

      const mockResponse = {
        summary: "Test summary",
        ai_context: "Test context",
        clarifying_questions: ["Q1", "Q2"],
        area_suggestions: {
          asset_tools: "to_review",
          information_data: "to_review",
          access_privileges: "to_review",
          process_controls: "to_review",
          risk_impact: "to_review",
          policies_docs: "to_review",
          people_awareness: "to_review",
        },
        suggested_actions: [{ description: "Action 1", area_key: null }],
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await analyzeDecision({
        freeText: "We are switching from Slack to Teams",
        workspaceId: mockWorkspaceId,
      });

      // Verify fetch was called correctly with JWT ES256 workaround headers
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/functions/v1/impact-assist`,
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: `Bearer ${mockAnonKey}`, // Anon key to bypass platform JWT check
            "x-user-token": mockAccessToken, // User token for actual auth
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            freeText: "We are switching from Slack to Teams",
            workspaceId: mockWorkspaceId,
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it("throws ImpactAssistError on API error response", async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "test-user-id" } },
            error: null,
          }),
          getSession: vi.fn().mockResolvedValue({
            data: {
              session: { access_token: mockAccessToken },
            },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createClient>);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 403,
        json: vi.fn().mockResolvedValue({ error: "Access denied to workspace" }),
      } as unknown as Response);

      await expect(
        analyzeDecision({
          freeText: "Test decision",
          workspaceId: mockWorkspaceId,
        })
      ).rejects.toThrow("Access denied to workspace");
    });

    it("throws ImpactAssistError when Supabase URL is not configured", async () => {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "test-user-id" } },
            error: null,
          }),
          getSession: vi.fn().mockResolvedValue({
            data: {
              session: { access_token: mockAccessToken },
            },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createClient>);

      await expect(
        analyzeDecision({
          freeText: "Test decision",
          workspaceId: mockWorkspaceId,
        })
      ).rejects.toMatchObject({
        status: 500,
        code: "CONFIG_ERROR",
      });
    });

    it("throws ImpactAssistError when anon key is not configured", async () => {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "test-user-id" } },
            error: null,
          }),
          getSession: vi.fn().mockResolvedValue({
            data: {
              session: { access_token: mockAccessToken },
            },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createClient>);

      await expect(
        analyzeDecision({
          freeText: "Test decision",
          workspaceId: mockWorkspaceId,
        })
      ).rejects.toMatchObject({
        status: 500,
        code: "CONFIG_ERROR",
      });
    });
  });

  describe("ImpactAssistError", () => {
    it("creates error with status and code", () => {
      const error = new ImpactAssistError("Test error", 400, "BAD_REQUEST");

      expect(error.message).toBe("Test error");
      expect(error.status).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.name).toBe("ImpactAssistError");
    });
  });

  describe("IMPACT_ASSIST_CONFIG", () => {
    it("has correct configuration values", () => {
      expect(IMPACT_ASSIST_CONFIG.MIN_CHARS).toBe(10);
      expect(IMPACT_ASSIST_CONFIG.MAX_CHARS).toBe(5000);
      expect(IMPACT_ASSIST_CONFIG.TIMEOUT_MS).toBe(30000);
    });
  });
});
