import { v4 as uuidv4 } from 'uuid';
import { tradeBusinessDbc } from '../../../dbModel.js';

// Data access for the single-use, revocable password-reset tokens.
//
// Only the sha256 hex digest of the opaque reset token is ever stored — the
// raw token lives solely inside the emailed link. A database leak therefore
// cannot be replayed directly, and a leaked row reveals nothing about the
// original link.

export const RESET_TABLE = 'user_password_resets';

/**
 * Persist a new reset token row.
 */
export const createPasswordReset = async ({
  userId,
  tokenHash,
  expiresAt,
  requestedIp = null,
  requestedUa = null,
}) => {
  const id = uuidv4();
  await tradeBusinessDbc.executeQuery(
    `INSERT INTO ${RESET_TABLE}
      (id, user_id, token_hash, expires_at, requested_ip, requested_ua, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [id, userId, tokenHash, expiresAt, requestedIp, requestedUa, new Date()],
  );
  return { id, user_id: userId };
};

/**
 * Find a reset row by its token hash.
 */
export const findResetByHash = async (tokenHash) => {
  if (!tokenHash) return null;
  const rows = await tradeBusinessDbc.executeQuery(
    `SELECT * FROM ${RESET_TABLE} WHERE token_hash = ? LIMIT 1;`,
    [tokenHash],
  );
  return rows?.[0] || null;
};

/**
 * Mark a reset row as used (single-use guarantee).
 */
export const markResetUsed = async (id) => {
  await tradeBusinessDbc.executeQuery(
    `UPDATE ${RESET_TABLE} SET used_at = ? WHERE id = ?;`,
    [new Date(), id],
  );
};

/**
 * Invalidate (delete) every outstanding reset for a user so that only the most
 * recently issued link remains usable.
 */
export const invalidateUserResets = async (userId) => {
  if (!userId) return;
  await tradeBusinessDbc.executeQuery(
    `DELETE FROM ${RESET_TABLE} WHERE user_id = ?;`,
    [userId],
  );
};

/**
 * Remove expired rows (housekeeping).
 */
export const deleteExpiredResets = async () => {
  await tradeBusinessDbc.executeQuery(
    `DELETE FROM ${RESET_TABLE} WHERE expires_at < ?;`,
    [new Date()],
  );
};
