/**
 * Script per testare i template email
 * Uso: npx tsx scripts/test-email.ts [login|invite]
 
# Invia entrambe
npx tsx scripts/test-email.ts

# Solo login
npx tsx scripts/test-email.ts login

# Solo invito
npx tsx scripts/test-email.ts invite
*/

import { Resend } from "resend";
import { loginEmailTemplate, inviteEmailTemplate } from "../src/lib/email/templates";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_EiDv2w11_HzfDViBEVdUFyUhYVdjZELuK";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Decision Trail <noreply@mydecisiontrail.com>";
const TO_EMAIL = "alessandro.l@aworld.org";

const resend = new Resend(RESEND_API_KEY);

async function sendTestLogin() {
  const mockLink = "http://localhost:3000/auth/callback?token_hash=abc123xyz&type=magiclink";

  console.log("Invio email di test LOGIN...");

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: "[TEST] Accedi a Decision Trail",
    html: loginEmailTemplate(mockLink),
  });

  if (error) {
    console.error("Errore:", error);
    return;
  }

  console.log("Email inviata! ID:", data?.id);
}

async function sendTestInvite() {
  const mockLink = "http://localhost:3000/auth/callback?token_hash=abc123xyz&type=magiclink";

  console.log("Invio email di test INVITO...");

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: "[TEST] Sei stato invitato a Acme Corp - Decision Trail",
    html: inviteEmailTemplate(mockLink, "Acme Corp", "Mario Rossi"),
  });

  if (error) {
    console.error("Errore:", error);
    return;
  }

  console.log("Email inviata! ID:", data?.id);
}

async function main() {
  const type = process.argv[2] || "both";

  console.log(`\nTest email templates - destinatario: ${TO_EMAIL}\n`);

  if (type === "login" || type === "both") {
    await sendTestLogin();
  }

  if (type === "invite" || type === "both") {
    await sendTestInvite();
  }

  console.log("\nDone!");
}

main().catch(console.error);
