import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import AppError from './appError.js';

// Purpose tags carried inside the magic-link JWT so a token minted for one flow
// can never be replayed against another.
export const MAGIC_LINK_PURPOSES = {
  SIGNUP: 'signup',
  LOGIN: 'login',
  PASSWORD_RESET: 'password-reset',
};

const getSecret = () =>
  process.env.MAGIC_LINK_SECRET || process.env.JWT_SECRET;

const getExpiresIn = () => process.env.MAGIC_LINK_EXPIRES_IN || '15m';

/**
 * Sign a short-lived, purpose-scoped JWT for the email magic-link flow.
 * @param {{ email: string, purpose: 'signup'|'login', first_name?: string, last_name?: string }} input
 * @returns {string} signed JWT
 */
export const signMagicLinkToken = ({ email, purpose, first_name, last_name }) => {
  if (!email) throw new AppError('An email address is required.', 400);
  if (!Object.values(MAGIC_LINK_PURPOSES).includes(purpose)) {
    throw new AppError('Invalid magic-link purpose.', 400);
  }

  return jwt.sign(
    {
      email: String(email).trim().toLowerCase(),
      purpose,
      first_name: String(first_name ?? '').trim(),
      last_name: String(last_name ?? '').trim(),
    },
    getSecret(),
    { expiresIn: getExpiresIn(), algorithm: 'HS256' },
  );
};

/**
 * Peek at a token's `purpose` claim without verifying its signature. Used by
 * callers that need to route a token to the correct flow before running a
 * strict, purpose-scoped verification. Returns null when the token is not
 * decodable.
 * @param {string} token
 * @returns {string|null}
 */
export const readMagicLinkPurpose = (token) => {
  if (!token) return null;
  try {
    return jwt.decode(token)?.purpose ?? null;
  } catch {
    return null;
  }
};

/**
 * Verify a magic-link JWT and enforce that it was minted for the expected
 * purpose. Throws an `AppError` on any failure (malformed, expired, or
 * wrong purpose).
 * @param {string} token
 * @param {'signup'|'login'} expectedPurpose
 * @returns {{ email: string, purpose: string, first_name: string, last_name: string }}
 */
export const verifyMagicLinkToken = (token, expectedPurpose) => {
  if (!token) throw new AppError('A magic-link token is required.', 400);

  let decoded;
  try {
    decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
  } catch (err) {
    if (err && err.name === 'TokenExpiredError') {
      throw new AppError('This link has expired. Please request a new one.', 400);
    }
    throw new AppError('This link is invalid. Please request a new one.', 401);
  }

  const email = String(decoded?.email ?? '')
    .trim()
    .toLowerCase();
  if (!email) {
    throw new AppError('This link is missing an email address.', 401);
  }

  if (decoded?.purpose !== expectedPurpose) {
    throw new AppError('This link cannot be used for this action.', 401);
  }

  return {
    email,
    purpose: decoded.purpose,
    first_name: String(decoded?.first_name ?? '').trim(),
    last_name: String(decoded?.last_name ?? '').trim(),
  };
};

/**
 * Build the clickable URL a recipient lands on to redeem the token. The
 * frontend already has a `/finishSignUp` route, so we hand the token back
 * through a query parameter.
 * @param {string} token
 * @returns {string} absolute URL
 */
export const buildMagicLink = (token) => {
  const base = (process.env.APP_BASE_URL || '').replace(/\/+$/, '');
  return `${base}/finishSignUp?token=${encodeURIComponent(token)}`;
};

/**
 * Build the clickable URL a recipient lands on to redeem a password-reset
 * token. Mirrors `buildMagicLink` but targets the dedicated `/resetPassword`
 * route so a reset token can never be replayed against the sign-up/sign-in
 * flow (and vice-versa, thanks to the purpose claim).
 * @param {string} token
 * @returns {string} absolute URL
 */
export const buildPasswordResetLink = (token) => {
  const base = (process.env.APP_BASE_URL || '').replace(/\/+$/, '');
  return `${base}/resetPassword?token=${encodeURIComponent(token)}`;
};

/**
 * Generate an opaque, cryptographically-random password-reset token. Unlike the
 * magic-link JWT, this is a bearer secret with no embedded state: the server
 * stores only its sha256 hash (see `hashPasswordResetToken`) in a database row
 * that enforces single-use and revocability.
 * @returns {string} 43-char base64url token
 */
export const generatePasswordResetToken = () =>
  crypto.randomBytes(32).toString('base64url');

/**
 * Hash a reset token for at-rest storage and lookup.
 * @param {string} token
 * @returns {string} sha256 hex digest
 */
export const hashPasswordResetToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');
