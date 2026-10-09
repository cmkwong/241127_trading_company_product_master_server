import logger from './logger.js';
import { securityConfig } from './securityConfig.js';

// Minimum acceptable secret length (characters). Generated secrets are 64-char
// base64url; anything shorter is almost certainly hand-typed and
// dictionary-guessable.
const MIN_SECRET_LENGTH = 32;

/**
 * Validate security-critical environment variables at startup.
 *
 * In strict mode a violation aborts the process (process.exit(1)) so a weak or
 * missing secret can never ship silently. In relaxed mode the same problems are
 * logged as warnings so local development is not blocked.
 */
export const assertSecureEnv = () => {
  const problems = [];

  const jwtSecret = process.env.JWT_SECRET;
  const magicSecret = process.env.MAGIC_LINK_SECRET;

  if (!jwtSecret || jwtSecret.length < MIN_SECRET_LENGTH) {
    problems.push(
      `JWT_SECRET is ${jwtSecret ? 'too short' : 'missing'} (must be >= ${MIN_SECRET_LENGTH} chars).`,
    );
  }

  if (!magicSecret || magicSecret.length < MIN_SECRET_LENGTH) {
    problems.push(
      `MAGIC_LINK_SECRET is ${magicSecret ? 'too short' : 'missing'} (must be >= ${MIN_SECRET_LENGTH} chars).`,
    );
  }

  if (jwtSecret && magicSecret && jwtSecret === magicSecret) {
    problems.push('MAGIC_LINK_SECRET must not equal JWT_SECRET.');
  }

  if (securityConfig.requireHttpsBaseUrl) {
    const base = String(process.env.APP_BASE_URL || '');
    if (!base.startsWith('https://')) {
      problems.push('APP_BASE_URL must use https:// in production.');
    }
  }

  if (problems.length === 0) {
    logger.info('Security environment validation passed.');
    return;
  }

  const summary = problems.join(' ');

  if (securityConfig.assertSecretStrength) {
    logger.error(`Security environment validation FAILED: ${summary}`);
    process.exit(1);
  }

  logger.warn(`Security environment validation (relaxed): ${summary}`);
};
