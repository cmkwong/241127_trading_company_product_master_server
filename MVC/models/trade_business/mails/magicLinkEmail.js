// Email template for the passwordless "magic link" SIGN-UP flow.
// Pure function — no side effects — so it can be exercised without SMTP.
//
// Shares its chrome (brand header band, footer, palette and responsive shell)
// with the sign-in template (`loginMagicLinkEmail.js`) via `emailChrome.js`,
// so both emails read as one consistent brand. Only the copy and the security
// notice differ per purpose.

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

const copy = {
  signup: {
    subject: `Verify your email for ${BRAND_NAME}`,
    eyebrow: 'Confirm your email',
    headline: 'Verify your email address',
    body: 'Thanks for signing up. Click the button below to confirm your email address and finish creating your account.',
    action: 'Verify my email',
    noticeTitle: 'Didn&rsquo;t sign up?',
    noticeBody: `If you didn&rsquo;t create a ${BRAND_NAME} account, you can safely ignore this email — no account is created unless you open the link.`,
    plainNotice: `Didn't sign up? If you didn't create a ${BRAND_NAME} account, you can safely ignore this email — no account is created unless you open the link.`,
    preheader: `Confirm your email for ${BRAND_NAME}`,
  },
  login: {
    subject: `Your ${BRAND_NAME} sign-in link`,
    eyebrow: 'Secure sign-in',
    headline: 'Sign in to your account',
    body: 'Click the button below to sign in. For your security this link is single-purpose and expires soon.',
    action: `Sign in to ${BRAND_NAME}`,
    noticeTitle: 'Didn&rsquo;t request this?',
    noticeBody: 'You can safely ignore this email. Your password has not changed and nobody can sign in with this link unless they open it.',
    plainNotice: "Didn't request this? You can safely ignore this email — your password has not changed.",
    preheader: `Your single-use ${BRAND_NAME} sign-in link`,
  },
};

/**
 * Build the subject and HTML/plaintext bodies for a magic-link email.
 * @param {{ link: string, firstName?: string, purpose?: 'signup'|'login', expiresInMinutes?: number }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export const buildMagicLinkEmail = ({
  link,
  firstName = '',
  purpose = 'login',
  expiresInMinutes = 15,
}) => {
  const c = copy[purpose] || copy.login;
  const minutes = Number(expiresInMinutes) || 15;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hello,';

  const bodyRows = `
              <tr>
                <td style="background-color:#ffffff;padding:36px 32px;">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND_CORAL};">${c.eyebrow}</p>
                  <h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:${BRAND_NAVY};font-family:'Instrument Sans','Inter',Arial,sans-serif;">${c.headline}</h1>
                  <p style="margin:0 0 8px;font-size:16px;line-height:1.55;color:${TEXT_BODY};">${greeting}</p>
                  <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:${TEXT_BODY};">${escapeHtml(c.body)}</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom:14px;">
                        <a href="${escapeHtml(link)}" style="display:inline-block;background-color:${CTA_CORAL};color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;line-height:1;padding:17px 40px;border-radius:10px;">${escapeHtml(c.action)}</a>
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
                        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${BRAND_NAVY};">${c.noticeTitle}</p>
                        <p style="margin:0;font-size:13px;line-height:1.5;color:${TEXT_SUBTLE};">${c.noticeBody}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;

  const html = renderEmailLayout({
    title: c.subject,
    preheaderText: `${c.preheader}. Expires in ${minutes} minutes.`,
    rows: `${brandHeaderBand()}${bodyRows}${emailFooter()}`,
  });

  const text = [
    `${BRAND_NAME} — ${c.headline}`,
    '',
    greeting,
    '',
    c.body,
    '',
    `${c.action}: ${link}`,
    '',
    `This link expires in ${minutes} minutes and can only be used once.`,
    '',
    c.plainNotice,
    ...textFooterLines,
  ].join('\n');

  return { subject: c.subject, html, text };
};

export default buildMagicLinkEmail;
