/**
 * Template email per Decision Trail
 * Allineati allo UI Kit (Design System v1)
 * Font: Geist Sans (fallback: system fonts)
 * Tutte le email sono in italiano
 */

// Colori dal Design System (light mode, convertiti in hex per compatibilità email)
const colors = {
  // Primary - Viola Clerk-style (oklch 0.60 0.23 286)
  primary: "#7c3aed",
  primaryDark: "#6d28d9",

  // Backgrounds
  background: "#ffffff",
  backgroundSoft: "#fafafa", // più neutro come nell'app

  // Text (da UI Kit)
  textPrimary: "#0f172a", // slate-900
  textSecondary: "#475569", // slate-600
  textTertiary: "#94a3b8", // slate-400

  // Border
  border: "#e2e8f0", // slate-200
  borderLight: "#f1f5f9", // slate-100

  // Muted
  muted: "#f8fafc",
};

// URL del logo (da aggiornare con il dominio di produzione)
const logoUrl = "https://mydecisiontrail.com/decisiontrail.png";

// Font stack che replica Geist Sans con fallback
const fontFamily = `'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;

/**
 * Email per login con magic link
 */
export function loginEmailTemplate(link: string): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Accedi a Decision Trail</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.backgroundSoft}; font-family: ${fontFamily}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 48px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">
          <!-- Card -->
          <tr>
            <td style="background-color: ${colors.background}; border-radius: 10px; border: 1px solid ${colors.border}; padding: 40px 32px;">

              <!-- Logo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 32px; border-bottom: 1px solid ${colors.borderLight};">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="${logoUrl}" width="28" height="28" alt="Decision Trail" style="display: block;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 18px; font-weight: 600; color: ${colors.textPrimary}; letter-spacing: -0.02em;">Decision Trail</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Content -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top: 32px;">
                    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${colors.textPrimary}; letter-spacing: -0.02em; line-height: 1.3;">
                      Accedi al tuo account
                    </h1>
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: ${colors.textSecondary};">
                      Clicca il pulsante qui sotto per accedere a Decision Trail. Il link è valido per 1 ora.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${link}" style="display: inline-block; background: linear-gradient(to bottom, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; padding: 6px 12px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 13px; line-height: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.12);">
                      Accedi ora
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: ${colors.muted}; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: ${colors.textSecondary};">
                      Oppure copia questo link:
                    </p>
                    <p style="margin: 0; font-size: 12px; color: ${colors.textTertiary}; word-break: break-all; line-height: 1.5;">
                      ${link}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top: 32px; border-top: 1px solid ${colors.borderLight}; margin-top: 32px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: ${colors.textTertiary}; text-align: center;">
                      Se non hai richiesto questo accesso, ignora questa email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Branding footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: ${colors.textTertiary};">
                Decision Trail
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Email per invito a workspace
 */
export function inviteEmailTemplate(
  link: string,
  workspaceName: string,
  inviterName?: string
): string {
  const inviterText = inviterName
    ? `<strong style="color: ${colors.textPrimary}; font-weight: 600;">${inviterName}</strong> ti ha invitato a collaborare su`
    : "Sei stato invitato a collaborare su";

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Invito a ${workspaceName} - Decision Trail</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.backgroundSoft}; font-family: ${fontFamily}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 48px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">
          <!-- Card -->
          <tr>
            <td style="background-color: ${colors.background}; border-radius: 10px; border: 1px solid ${colors.border}; padding: 40px 32px;">

              <!-- Logo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 32px; border-bottom: 1px solid ${colors.borderLight};">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="${logoUrl}" width="28" height="28" alt="Decision Trail" style="display: block;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 18px; font-weight: 600; color: ${colors.textPrimary}; letter-spacing: -0.02em;">Decision Trail</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Content -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top: 32px;">
                    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: ${colors.textPrimary}; letter-spacing: -0.02em; line-height: 1.3;">
                      Sei stato invitato!
                    </h1>
                    <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: ${colors.textSecondary};">
                      ${inviterText}
                    </p>
                    <p style="margin: 0 0 24px 0;">
                      <span style="display: inline-block; background-color: ${colors.muted}; color: ${colors.primary}; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                        ${workspaceName}
                      </span>
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: ${colors.textSecondary};">
                      Decision Trail ti aiuta a tracciare decisioni, cambiamenti e incidenti, valutandone l'impatto in modo strutturato.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${link}" style="display: inline-block; background: linear-gradient(to bottom, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; padding: 6px 12px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 13px; line-height: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.12);">
                      Accetta l'invito
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: ${colors.muted}; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: ${colors.textSecondary};">
                      Oppure copia questo link:
                    </p>
                    <p style="margin: 0; font-size: 12px; color: ${colors.textTertiary}; word-break: break-all; line-height: 1.5;">
                      ${link}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top: 32px; border-top: 1px solid ${colors.borderLight}; margin-top: 32px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: ${colors.textTertiary}; text-align: center;">
                      Se non ti aspettavi questo invito, ignora questa email.<br>
                      Il link scade tra 7 giorni.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Branding footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: ${colors.textTertiary};">
                Decision Trail
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
