import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { inviteEmailTemplate } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, email, role } = body;

    if (!workspaceId || !email) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato email non valido" },
        { status: 400 }
      );
    }

    // Create authenticated Supabase client (uses user's session)
    const supabase = await createClient();

    // Verify the user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Create invitation in database (RPC will verify owner status)
    const { data: invitationId, error: inviteError } = await supabase.rpc(
      "send_workspace_invitation",
      {
        p_workspace_id: workspaceId,
        p_email: email.toLowerCase(),
        p_role: role || "member",
      }
    );

    if (inviteError) {
      console.error("[Invite] Error creating invitation:", inviteError);

      if (inviteError.message.includes("Only workspace owners")) {
        return NextResponse.json(
          { error: "Solo i proprietari possono inviare inviti" },
          { status: 403 }
        );
      }
      if (inviteError.message.includes("already a member")) {
        return NextResponse.json(
          { error: "L'utente è già membro di questo workspace" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      );
    }

    // Check required environment variables
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!serviceRoleKey || !resendApiKey) {
      console.warn("[Invite] Missing env vars, invitation created but email not sent");
      return NextResponse.json({
        success: true,
        invitationId,
        emailSent: false,
        message: "Invito creato ma email non inviata (configurazione incompleta)",
      });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Check if user exists, create if not
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!existingUser) {
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true,
      });

      if (createError) {
        console.error("[Invite] Error creating user:", createError);
        return NextResponse.json({
          success: true,
          invitationId,
          emailSent: false,
          message: "Invito creato ma email non inviata",
        });
      }
    }

    // Generate magic link
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: email.toLowerCase(),
        options: {
          redirectTo: `${appUrl}/auth/callback`,
        },
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[Invite] Error generating link:", linkError);
      return NextResponse.json({
        success: true,
        invitationId,
        emailSent: false,
        message: "Invito creato ma email non inviata",
      });
    }

    // Build direct link
    const directLink = `${appUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`;

    // Get workspace name and inviter info
    const { data: workspace } = await supabase
      .from("workspace")
      .select("name")
      .eq("id", workspaceId)
      .single();

    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", user.id)
      .single();

    const workspaceName = workspace?.name || "un workspace";
    const inviterName = inviterProfile?.display_name || inviterProfile?.email;

    // Send email via Resend
    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Decision Trail <onboarding@resend.dev>";

    const { error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: email.toLowerCase(),
      subject: `Sei stato invitato a ${workspaceName} su Decision Trail`,
      html: inviteEmailTemplate(directLink, workspaceName, inviterName),
    });

    if (resendError) {
      console.error("[Invite] Resend error:", resendError);
      return NextResponse.json({
        success: true,
        invitationId,
        emailSent: false,
        message: "Invito creato ma email non inviata",
      });
    }

    return NextResponse.json({
      success: true,
      invitationId,
      emailSent: true,
      message: "Invito inviato con successo",
    });
  } catch (error) {
    console.error("[Invite] Error:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
