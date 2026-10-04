import catchAsync from '../../../../../utils/catchAsync.js';
import AppError from '../../../../../utils/appError.js';
import { userModel } from '../../../../models/trade_business/home_page/users/data_users.js';
import {
  getAuthByUserId,
  verifyPassword,
  setUserPassword as upsertUserPassword,
} from '../../../../models/trade_business/home_page/users/data_user_auths.js';

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