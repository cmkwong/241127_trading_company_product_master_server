// Centralised security configuration, read once at process start.
//
// The server has no per-environment dotenv files; instead a single
// SECURITY_STRICT flag controls how strict the hardening is. It defaults to
// STRICT so a forgotten flag can never silently weaken production.
//
//   SECURITY_STRICT absent or "true"  -> strict (production) behaviour
//   SECURITY_STRICT=false             -> relaxed (local development) behaviour
//
// Individual features read this object rather than scattering NODE_ENV /
// process.env checks throughout the codebase.

import {} from 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';
const strict = process.env.SECURITY_STRICT === 'false' ? false : true;

export const securityConfig = {
  // Flip this one flag to relax development-time friction.
  strict,

  // Fail hard at boot on weak/duplicated secrets. Relaxed mode logs a warning
  // instead so local dev can use a short secret without blocking startup.
  assertSecretStrength: strict,

  // Only enforce an https:// APP_BASE_URL in a real production environment.
  requireHttpsBaseUrl: isProd,

  // Server-side rate limits for the forgot-password flow. Relaxed mode keeps
  // the middleware wired (so the code path is always exercised) but raises the
  // ceilings to effectively unlimited for local testing.
  rateLimits: strict
    ? {
        windowMs: 15 * 60 * 1000, // 15 minutes
        forgotPerEmail: 5,
        forgotPerIp: 5,
        confirmPerIp: 10,
      }
    : {
        windowMs: 60 * 1000, // 1 minute (dev: window resets quickly)
        forgotPerEmail: 200,
        forgotPerIp: 500,
        confirmPerIp: 500,
      },

  // Session revocation via the per-user token_version. Kept ON in development
  // too (so a missed issue-site surfaces as a warning, not a login loop), but
  // relaxed mode FAILS OPEN on legacy tokens without a version segment.
  enforceTokenVersion: true,
  rejectLegacyTokens: strict,

  // In development, await the SMTP send so transient email failures are
  // visible; in production keep the send off the request path (fire-and-forget)
  // so endpoint timing does not reveal which accounts are registered.
  awaitMail: !strict,

  resetTokenTtlMinutes: 15,
};
