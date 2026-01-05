import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Also check for hash fragment parameters (Supabase sometimes uses these)
  // Note: hash fragments are not sent to server, but we can check URL params
  const access_token = searchParams.get("access_token");
  const refresh_token = searchParams.get("refresh_token");

  console.log("[Callback] URL:", url.toString());
  console.log("[Callback] Params - code:", !!code, "token_hash:", !!token_hash, "type:", type, "access_token:", !!access_token);

  const supabase = await createClient();

  // Handle PKCE flow (magic link / normal signup)
  if (code) {
    console.log("[Callback] Exchanging code for session");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectToWorkspace(request, supabase, origin);
    }
    console.error("[Callback] Error exchanging code for session:", error);
  }

  // Handle token hash flow (invitation / recovery / email change / magiclink)
  if (token_hash && type) {
    console.log("[Callback] Verifying OTP with token_hash, type:", type);
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "invite" | "recovery" | "email" | "signup" | "magiclink",
    });
    if (!error && data.session) {
      console.log("[Callback] OTP verified successfully, user:", data.user?.email);
      return redirectToWorkspace(request, supabase, origin);
    }
    console.error("[Callback] Error verifying OTP:", error, "data:", data);
  }

  // If we have access_token in URL (implicit flow), try to set session
  if (access_token && refresh_token) {
    console.log("[Callback] Setting session from tokens");
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (!error) {
      return redirectToWorkspace(request, supabase, origin);
    }
    console.error("[Callback] Error setting session:", error);
  }

  console.log("[Callback] No valid auth params found, redirecting to login");
  // Return to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}

async function redirectToWorkspace(
  request: Request,
  supabase: Awaited<ReturnType<typeof createClient>>,
  origin: string
) {
  // DB trigger on_auth_user_created handles profile + workspace creation for NEW users
  // For EXISTING users logging in, we need to check for pending invitations
  // and accept them via RPC
  try {
    await supabase.rpc("accept_pending_invitations");
  } catch {
    // Ignore errors - RPC might not exist yet or user has no pending invites
  }

  // Get user's workspaces to redirect to the first one
  const { data: workspaces } = await supabase.rpc("get_user_workspaces");

  let redirectPath = "/workspaces";
  if (workspaces && workspaces.length > 0) {
    // Redirect to the first workspace's dashboard
    redirectPath = `/w/${workspaces[0].id}/dashboard`;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${redirectPath}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
  } else {
    return NextResponse.redirect(`${origin}${redirectPath}`);
  }
}
