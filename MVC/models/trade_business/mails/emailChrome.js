// Shared "chrome" for the passwordless magic-link emails.
// Pure functions + brand palette — no side effects — so they can be exercised
// without SMTP. This is the single source of truth for the brand header band,
// footer, colour tokens and responsive shell, consumed by both
// `loginMagicLinkEmail.js` (sign-in) and `magicLinkEmail.js` (sign-up) so the
// two emails stay visually consistent. Palette mirrors
// `src/components/common/variables.css`.

export const BRAND_NAME = 'RIVOLX';
export const BRAND_NAVY = '#0c1e36'; // --color-primary
export const BRAND_CORAL = '#fa6d5a'; // --color-accent
export const CTA_CORAL = '#e85d49'; // --color-accent-hover (3.4:1 on white text)
export const TEXT_BODY = '#334155';
export const TEXT_MUTED = '#94a3b8';
export const TEXT_SUBTLE = '#64748b';
export const BORDER = '#e2e8f0';
export const SURFACE = '#f4f6f8';
export const SURFACE_SOFT = '#f8fafc';

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Hidden inbox-preview text (kept out of the rendered body).
export const preheader = (text) => `
      <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:${SURFACE};">
        ${text}
        &#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;
      </div>`;

// Navy brand wordmark band — the top row of the email card.
export const brandHeaderBand = () => `
              <tr>
                <td style="background-color:${BRAND_NAVY};padding:28px 32px;">
                  <span style="display:inline-block;font-size:20px;font-weight:800;letter-spacing:2px;color:#ffffff;font-family:'Outfit','Inter',Arial,sans-serif;">${BRAND_NAME}</span>
                </td>
              </tr>`;

// White footer — the bottom row of the email card.
export const emailFooter = () => `
              <tr>
                <td style="background-color:#ffffff;border-top:1px solid ${BORDER};padding:22px 32px;">
                  <p style="margin:0 0 6px;font-size:12px;color:${TEXT_MUTED};">This is an automated message from ${BRAND_NAME} — please don&rsquo;t reply to it.</p>
                  <p style="margin:0;font-size:12px;color:${TEXT_MUTED};">&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
                </td>
              </tr>`;

// Plaintext footer lines, appended to every email's text fallback.
export const textFooterLines = [
  '',
  `This is an automated message from ${BRAND_NAME} — please don't reply to it.`,
  `© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.`,
];

/**
 * Assemble the full responsive document: DOCTYPE, head/meta (including
 * dark-mode color-scheme), outer surface table and the 600px rounded card.
 * `rows` should be the concatenated `<tr>` rows to place inside the card
 * (typically `brandHeaderBand()` + body + `emailFooter()`).
 * @param {{ title: string, preheaderText: string, rows: string }} input
 * @returns {string}
 */
export const renderEmailLayout = ({ title = '', preheaderText = '', rows = '' }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;padding:0;background-color:${SURFACE};font-family:'Inter',Arial,Helvetica,sans-serif;">
      ${preheader(preheaderText)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${SURFACE};">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-radius:16px;overflow:hidden;">
${rows}
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

export default renderEmailLayout;
