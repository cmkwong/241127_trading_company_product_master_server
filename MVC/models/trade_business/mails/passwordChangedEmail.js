// Email template for the "your password was changed" notification.
// Pure function — no side effects — so it can be exercised without SMTP.
// Shares its chrome with the other passwordless emails via `emailChrome.js`.

import {
  BRAND_NAME,
  BRAND_NAVY,
  BRAND_CORAL,
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
 * Build the subject and HTML/plaintext bodies for the password-changed email.
 * @param {{ firstName?: string }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export const buildPasswordChangedEmail = ({ firstName = '' }) => {
  const subject = `Your ${BRAND_NAME} password was changed`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hello,';

  const bodyRows = `
              <tr>
                <td style="background-color:#ffffff;padding:36px 32px;">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND_CORAL};">Account security</p>
                  <h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:${BRAND_NAVY};font-family:'Instrument Sans','Inter',Arial,sans-serif;">Your password was changed</h1>
                  <p style="margin:0 0 8px;font-size:16px;line-height:1.55;color:${TEXT_BODY};">${greeting}</p>
                  <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:${TEXT_BODY};">The password for your <strong>${BRAND_NAME}</strong> account was just changed. If this was you, no further action is needed.</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${SURFACE_SOFT};border:1px solid ${BORDER};border-left:3px solid ${BRAND_CORAL};border-radius:8px;">
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${BRAND_NAVY};">Didn&rsquo;t change your password?</p>
                        <p style="margin:0;font-size:13px;line-height:1.5;color:${TEXT_SUBTLE};">If you didn&rsquo;t make this change, reset your password immediately and contact support.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;

  const html = renderEmailLayout({
    title: subject,
    preheaderText: `Your ${BRAND_NAME} password was changed.`,
    rows: `${brandHeaderBand()}${bodyRows}${emailFooter()}`,
  });

  const text = [
    `${BRAND_NAME} — your password was changed`,
    '',
    greeting,
    '',
    `The password for your ${BRAND_NAME} account was just changed. If this was you, no further action is needed.`,
    '',
    "If you didn't change your password, reset it immediately and contact support.",
    ...textFooterLines,
  ].join('\n');

  return { subject, html, text };
};

export default buildPasswordChangedEmail;
