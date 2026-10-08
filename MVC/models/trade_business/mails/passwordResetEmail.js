// Email template for the "forgot password" (reset) flow.
// Pure function — no side effects — so it can be exercised without SMTP.
//
// Shares its chrome (brand header band, footer, palette and responsive shell)
// with the sign-in/sign-up templates via `emailChrome.js`, so every
// passwordless email reads as one consistent brand. Only the copy differs.

import {
  BRAND_NAME,
  BRAND_NAVY,
  BRAND_CORAL,
  CTA_CORAL,
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_SUBTLE,
  BORDER,
  SURFACE_SOFT,
  escapeHtml,
  brandHeaderBand,
  emailFooter,
  renderEmailLayout,
  textFooterLines,
} from './emailChrome.js';

/**
 * Build the subject and HTML/plaintext bodies for the password-reset email.
 * @param {{ link: string, firstName?: string, expiresInMinutes?: number }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export const buildPasswordResetEmail = ({
  link,
  firstName = '',
  expiresInMinutes = 15,
}) => {
  const minutes = Number(expiresInMinutes) || 15;
  const subject = `Reset your ${BRAND_NAME} password`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hello,';

  const bodyRows = `
              <tr>
                <td style="background-color:#ffffff;padding:36px 32px;">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND_CORAL};">Password reset</p>
                  <h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:${BRAND_NAVY};font-family:'Instrument Sans','Inter',Arial,sans-serif;">Reset your password</h1>
                  <p style="margin:0 0 8px;font-size:16px;line-height:1.55;color:${TEXT_BODY};">${greeting}</p>
                  <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:${TEXT_BODY};">We received a request to reset the password for your <strong>${BRAND_NAME}</strong> account. Click the button below to choose a new password.</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom:14px;">
                        <a href="${escapeHtml(link)}" style="display:inline-block;background-color:${CTA_CORAL};color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;line-height:1;padding:17px 40px;border-radius:10px;">Choose a new password</a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom:28px;">
                        <span style="font-size:13px;color:${TEXT_MUTED};">This link expires in <strong style="color:${TEXT_SUBTLE};">${minutes} minutes</strong> and can only be used once.</span>
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${SURFACE_SOFT};border:1px solid ${BORDER};border-left:3px solid ${BRAND_CORAL};border-radius:8px;">
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${BRAND_NAVY};">Didn&rsquo;t request this?</p>
                        <p style="margin:0;font-size:13px;line-height:1.5;color:${TEXT_SUBTLE};">You can safely ignore this email. Your password has not changed and nobody can reset it unless they open this link.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;

  const html = renderEmailLayout({
    title: subject,
    preheaderText: `Reset your ${BRAND_NAME} password. Expires in ${minutes} minutes.`,
    rows: `${brandHeaderBand()}${bodyRows}${emailFooter()}`,
  });

  const text = [
    `${BRAND_NAME} — reset your password`,
    '',
    greeting,
    '',
    `We received a request to reset the password for your ${BRAND_NAME} account. Use the link below to choose a new password.`,
    '',
    `Choose a new password: ${link}`,
    '',
    `This link expires in ${minutes} minutes and can only be used once.`,
    '',
    "Didn't request this? You can safely ignore this email — your password has not changed.",
    ...textFooterLines,
  ].join('\n');

  return { subject, html, text };
};

export default buildPasswordResetEmail;
