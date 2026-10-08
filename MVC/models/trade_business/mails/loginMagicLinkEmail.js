// Email template for the passwordless "magic link" SIGN-IN flow.
// Pure function — no side effects — so it can be exercised without SMTP.
//
// Shares its chrome (brand header band, footer, palette and responsive shell)
// with the sign-up template (`magicLinkEmail.js`) via `emailChrome.js`. This one
// leads with the navy brand band, a coral eyebrow, an expiry hint and a
// "didn't request this?" notice, mirroring the in-app `/signup` login panel.

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
 * Build the subject and HTML/plaintext bodies for the magic-link SIGN-IN email.
 * @param {{ link: string, firstName?: string, expiresInMinutes?: number }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export const buildLoginMagicLinkEmail = ({
  link,
  firstName = '',
  expiresInMinutes = 15,
}) => {
  const minutes = Number(expiresInMinutes) || 15;
  const subject = `Your ${BRAND_NAME} sign-in link`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hello,';

  const bodyRows = `
              <tr>
                <td style="background-color:#ffffff;padding:36px 32px;">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND_CORAL};">Secure sign-in</p>
                  <h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:${BRAND_NAVY};font-family:'Instrument Sans','Inter',Arial,sans-serif;">Sign in to your account</h1>
                  <p style="margin:0 0 8px;font-size:16px;line-height:1.55;color:${TEXT_BODY};">${greeting}</p>
                  <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:${TEXT_BODY};">Use the button below to sign in to <strong>${BRAND_NAME}</strong>. No password needed — this link signs you in once and then expires.</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom:14px;">
                        <a href="${escapeHtml(link)}" style="display:inline-block;background-color:${CTA_CORAL};color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;line-height:1;padding:17px 40px;border-radius:10px;">Sign in to ${BRAND_NAME}</a>
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
                        <p style="margin:0;font-size:13px;line-height:1.5;color:${TEXT_SUBTLE};">You can safely ignore this email. Your password has not changed and nobody can sign in with this link unless they open it.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;

  const html = renderEmailLayout({
    title: subject,
    preheaderText: `Your single-use ${BRAND_NAME} sign-in link. Expires in ${minutes} minutes.`,
    rows: `${brandHeaderBand()}${bodyRows}${emailFooter()}`,
  });

  const text = [
    `${BRAND_NAME} — sign in to your account`,
    '',
    greeting,
    '',
    'Use the link below to sign in. It works once and expires soon.',
    '',
    `Sign in to ${BRAND_NAME}: ${link}`,
    '',
    `This link expires in ${minutes} minutes and can only be used once.`,
    '',
    "Didn't request this? You can safely ignore this email — your password has not changed.",
    ...textFooterLines,
  ].join('\n');

  return { subject, html, text };
};

export default buildLoginMagicLinkEmail;
