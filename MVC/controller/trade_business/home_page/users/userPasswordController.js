import catchAsync from '../../../../../utils/catchAsync.js';
import AppError from '../../../../../utils/appError.js';
import logger from '../../../../../utils/logger.js';
import { securityConfig } from '../../../../../utils/securityConfig.js';
import { tradeBusinessDbc } from '../../../../models/dbModel.js';
import { userModel } from '../../../../models/trade_business/home_page/users/data_users.js';
import {
  getAuthByUserId,
  verifyPassword,
  setUserPassword as upsertUserPassword,
} from '../../../../models/trade_business/home_page/users/data_user_auths.js';
import {
  createPasswordReset,
  findResetByHash,
  markResetUsed,
  invalidateUserResets,
} from '../../../../models/trade_business/home_page/users/data_user_password_resets.js';
import { sendMail } from '../../../../../utils/mailer.js';
import {
  buildPasswordResetLink,
  generatePasswordResetToken,
  hashPasswordResetToken,
} from '../../../../../utils/magicLink.js';
import { buildPasswordResetEmail } from '../../../../models/trade_business/mails/passwordResetEmail.js';
import { buildPasswordChangedEmail } from '../../../../models/trade_business/mails/passwordChangedEmail.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resolveUserById = async (userId) => {
  const rows = await userModel.executeQuery(
    'SELECT id FROM users WHERE id = ? LIMIT 1;',
    [userId],
  );
  return rows?.[0] || null;
};

const resolveUserIdByName = async (userName) => {
  const rows = await userModel.executeQuery(
    'SELECT id FROM users WHERE user_name = ? LIMIT 1;',
    [userName],
  );
  return rows?.[0]?.id || null;
};

/**
 * Resolve the target user id for a password operation.
 * - Prefers an explicit `user_id` in the body (admin flows).
 * - Otherwise falls back to the authenticated `req.user.name` (self-service).
 */
const resolveTargetUserId = async (req) => {
  if (req.body.user_id) {
    const user = await resolveUserById(req.body.user_id);
    if (!user) throw new AppError('User not found.', 404);
    return req.body.user_id;
  }

  const name = req.user?.name;
  if (!name) {
    throw new AppError('Unable to determine the target user.', 400);
  }

  const id = await resolveUserIdByName(name);
  if (!id) throw new AppError('User not found.', 404);
  return id;
};

/**
 * Update the password for the current (or explicitly targeted) user.
 * Optionally verifies the current password before applying the new one.
 * @route POST /password/update
 */
export const updateUserPassword = catchAsync(async (req, res, next) => {
  const { current_password, new_password } = req.body;

  if (!new_password) {
    return next(new AppError('new_password is required.', 400));
  }

  const userId = await resolveTargetUserId(req);
  const auth = await getAuthByUserId(userId);

  if (!auth) {
    return next(new AppError('No password set for this user.', 404));
  }

  if (current_password) {
    const ok = await verifyPassword(current_password, auth.password_hash);
    if (!ok) {
      return next(new AppError('Current password is incorrect.', 401));
    }
  }

  const result = await upsertUserPassword(userId, new_password);

  res.status(200).json({
    status: 'success',
    data: { user_id: userId, ...result },
  });
});

/**
 * Reset a user's password without verifying the current one (admin).
 * @route POST /password/reset
 */
export const resetUserPassword = catchAsync(async (req, res, next) => {
  const { new_password } = req.body;

  if (!new_password) {
    return next(new AppError('new_password is required.', 400));
  }

  const userId = await resolveTargetUserId(req);
  const result = await upsertUserPassword(userId, new_password);

  res.status(200).json({
    status: 'success',
    data: { user_id: userId, ...result },
  });
});

/**
 * Create (or overwrite) the password for a user (admin).
 * @route POST /password/set
 */
export const setUserPassword = catchAsync(async (req, res, next) => {
  const { new_password } = req.body;

  if (!new_password) {
    return next(new AppError('new_password is required.', 400));
  }

  const userId = await resolveTargetUserId(req);
  const result = await upsertUserPassword(userId, new_password);

  res.status(201).json({
    status: 'success',
    data: { user_id: userId, ...result },
  });
});

/**
 * Verify a plain-text password against the stored bcrypt hash.
 * @route POST /password/verify
 */
export const verifyUserPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError('password is required.', 400));
  }

  const userId = await resolveTargetUserId(req);
  const auth = await getAuthByUserId(userId);

  const matched = auth ? await verifyPassword(password, auth.password_hash) : false;

  res.status(200).json({
    status: 'success',
    data: { matched },
  });
});

/**
 * Public "forgot password" trigger. Looks up the email, confirms the account
 * exists AND signs in with a password (a `user_auths` row is present), then
 * emails a short-lived, single-use opaque reset link. Responds successfully
 * whether or not a link was sent to avoid leaking which emails are registered.
 * @route POST /trade_business/home/users/password/forgot
 */
export const requestPasswordReset = catchAsync(async (req, res, next) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return next(new AppError('A valid email address is required.', 400));
  }

  const existing = await userModel.executeQuery(
    'SELECT id, first_name, last_name FROM users WHERE email = ? LIMIT 1;',
    [email],
  );
  const user = existing?.[0];

  if (user) {
    const auth = await getAuthByUserId(user.id);
    if (auth) {
      // 1) Invalidate any previous reset links so only the newest is usable.
      await invalidateUserResets(user.id);

      // 2) Issue an opaque, single-use token and store only its sha256 hash.
      const token = generatePasswordResetToken();
      const tokenHash = hashPasswordResetToken(token);
      const expiresAt = new Date(
        Date.now() + securityConfig.resetTokenTtlMinutes * 60 * 1000,
      );

      await createPasswordReset({
        userId: user.id,
        tokenHash,
        expiresAt,
        requestedIp: req.ip || null,
        requestedUa: String(req.headers?.['user-agent'] || '').slice(0, 255),
      });

      const { subject, html, text } = buildPasswordResetEmail({
        link: buildPasswordResetLink(token),
        firstName: user.first_name,
        expiresInMinutes: securityConfig.resetTokenTtlMinutes,
      });

      // 3) Keep the send off the request path in production so endpoint timing
      //    cannot reveal which accounts are registered; await it in development
      //    so transient SMTP failures are visible.
      const send = () => sendMail({ to: email, subject, html, text });
      if (securityConfig.awaitMail) {
        await send().catch((err) =>
          logger.error(
            `Failed to send password-reset email to ${email}: ${err.message}`,
          ),
        );
      } else {
        send().catch((err) =>
          logger.error(
            `Failed to send password-reset email to ${email}: ${err.message}`,
          ),
        );
      }
    }
  }

  // Always report success to prevent account enumeration.
  res.status(200).json({
    status: 'success',
    data: { sent: true },
  });
});

/**
 * Public password-reset redemption. Resolves the opaque single-use token to its
 * stored hash, marks it consumed and applies the new password to the account it
 * was minted for. Returns the account's email so the client can complete the
 * standard login exchange.
 * @route POST /trade_business/home/users/password/forgot/confirm
 */
export const resetPasswordWithToken = catchAsync(async (req, res, next) => {
  const { token, new_password } = req.body;

  if (!token) {
    return next(new AppError('A reset token is required.', 400));
  }
  if (typeof new_password !== 'string' || new_password.length < 8) {
    return next(
      new AppError('new_password must be at least 8 characters.', 400),
    );
  }

  // Resolve the opaque token to a stored reset row (single-use, revocable).
  const tokenHash = hashPasswordResetToken(token);
  const reset = await findResetByHash(tokenHash);

  if (!reset || reset.used_at || new Date(reset.expires_at) <= new Date()) {
    return next(
      new AppError(
        'This link is invalid or has expired. Please request a new one.',
        400,
      ),
    );
  }

  // Load the target user for the password write and notification step.
  const userRows = await userModel.executeQuery(
    'SELECT id, email, first_name FROM users WHERE id = ? LIMIT 1;',
    [reset.user_id],
  );
  const target = userRows?.[0];
  const userId = target?.id;
  const userEmail = target?.email;

  if (!userId) {
    return next(new AppError('No account found for this link.', 404));
  }

  await upsertUserPassword(userId, new_password);

  // Single-use: mark this token consumed and drop any sibling links.
  await markResetUsed(reset.id);
  await invalidateUserResets(userId);

  // Session revocation: bump token_version and record the change time so every
  // previously-issued JWT becomes stale.
  await tradeBusinessDbc.executeQuery(
    'UPDATE users SET password_changed_at = ?, token_version = COALESCE(token_version, 0) + 1 WHERE id = ?;',
    [new Date(), userId],
  );

  // Post-change notification (kept off the request path in production).
  const { subject, html, text } = buildPasswordChangedEmail({
    firstName: target.first_name,
  });
  const send = () => sendMail({ to: userEmail, subject, html, text });
  if (securityConfig.awaitMail) {
    await send().catch((err) =>
      logger.error(`Failed to send password-changed email: ${err.message}`),
    );
  } else {
    send().catch((err) =>
      logger.error(`Failed to send password-changed email: ${err.message}`),
    );
  }

  res.status(200).json({
    status: 'success',
    data: { email: userEmail },
  });
});