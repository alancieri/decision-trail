import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { loginEmailTemplate } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email richiesta" },
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

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!serviceRoleKey) {
      console.error("[Login API] SUPABASE_SERVICE_ROLE_KEY not configured");
      return NextResponse.json(
        { error: "Configurazione server incompleta" },
        { status: 500 }
      );
    }

    if (!resendApiKey) {
      console.error("[Login API] RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Configurazione server incompleta" },
        { status: 500 }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Check if user exists, create if not
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!userExists) {
      console.log("[Login API] Creating new user:", email);
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true, // Pre-confirm to avoid Supabase sending confirmation email
      });

      if (createError) {
        console.error("[Login API] Error creating user:", createError);
        return NextResponse.json(
          { error: "Impossibile creare l'account" },
          { status: 500 }
        );
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

    console.log("[Login API] Generated link for:", email, "hashed_token exists:", !!linkData?.properties?.hashed_token);

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[Login API] Error generating link:", linkError);
      return NextResponse.json(
        { error: "Impossibile generare il link di accesso" },
        { status: 500 }
      );
    }

    // Build direct link (bypass Supabase redirect)
    const directLink = `${appUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`;

    // Send email via Resend
    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Decision Trail <onboarding@resend.dev>";

    const { error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: email.toLowerCase(),
      subject: "Accedi a Decision Trail",
      html: loginEmailTemplate(directLink),
    });

    if (resendError) {
      console.error("[Login API] Resend error:", resendError);
      return NextResponse.json(
        { error: "Impossibile inviare l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email inviata con successo",
    });
  } catch (error) {
    console.error("[Login API] Error:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
