import nodemailer from 'nodemailer';
import logger from './logger.js';
import AppError from './appError.js';

let transporter = null;

/**
 * Lazily build (and cache) the nodemailer SMTP transporter from environment
 * variables. `secure` defaults to `false` (STARTTLS) and is forced to `true`
 * when the port is 465 (implicit TLS).
 */
export const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port) {
    throw new AppError(
      'Email transport is not configured (missing SMTP_HOST / SMTP_PORT).',
      500,
    );
  }

  const secure =
    process.env.SMTP_SECURE === 'true' ||
    String(process.env.SMTP_SECURE).toLowerCase() === 'true' ||
    port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    // Provide auth only when credentials are present; some relays accept
    // unauthenticated delivery on the local network.
    auth: user || pass ? { user, pass } : undefined,
  });

  return transporter;
};

/**
 * Send a single email through the shared SMTP transporter.
 * @param {{ to: string|string[], subject: string, html?: string, text?: string, from?: string }} mail
 * @returns {Promise<Object>} the nodemailer send result
 */
export const sendMail = async ({ to, subject, html, text, from }) => {
  const mailFrom = from || process.env.MAIL_FROM || process.env.SMTP_USER;

  try {
    const result = await getTransporter().sendMail({
      from: mailFrom,
      to,
      subject,
      html,
      text,
    });

    logger.info(
      `Email sent to ${Array.isArray(to) ? to.join(',') : to} (subject: ${subject})`,
    );
    return result;
  } catch (err) {
    logger.error(`Failed to send email: ${err.message}`);
    throw new AppError('Unable to send email. Please try again later.', 500);
  }
};

export default sendMail;
