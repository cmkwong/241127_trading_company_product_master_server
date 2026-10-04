import { v4 as uuidv4 } from 'uuid';
import DataModelUtils from '../../../../../utils/dataModelUtils.js';
import { TABLE_MASTER } from '../../../tables.js';
import { tradeBusinessDbc } from '../../../dbModel.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const userAuthModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: TABLE_MASTER['USER_AUTHS'].name,
  tableFields: TABLE_MASTER['USER_AUTHS'].fields,
  entityName: 'user auth',
  entityIdField: 'id',
  requiredFields: ['user_id', 'password_hash'],
  validations: {
    user_id: { required: true },
    password_hash: { required: true },
  },
  defaults: { id: uuidv4 },
});

/**
 * Hash a plain-text password with bcrypt.
 * @param {string} plainPassword
 * @returns {Promise<string>} bcrypt hash
 */
export const hashPassword = async (plainPassword) => {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('A non-empty plain password is required to hash.');
  }
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a bcrypt hash.
 * @param {string} plainPassword
 * @param {string} passwordHash
 * @returns {Promise<boolean>}
 */
export const verifyPassword = async (plainPassword, passwordHash) => {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
};

/**
 * Fetch the auth record (password row) for a given user id.
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export const getAuthByUserId = async (userId) => {
  if (!userId) return null;
  const rows = await userAuthModel.executeQuery(
    `SELECT * FROM ${userAuthModel.tableName} WHERE user_id = ? LIMIT 1;`,
    [userId],
  );
  return rows?.[0] || null;
};

/**
 * Create or update the bcrypt password for a user (upsert).
 * @param {string} userId
 * @param {string} plainPassword
 * @returns {Promise<{id: string, user_id: string, created: boolean}>}
 */
export const setUserPassword = async (userId, plainPassword) => {
  const passwordHash = await hashPassword(plainPassword);
  const existing = await getAuthByUserId(userId);

  if (existing) {
    await userAuthModel.update(existing.id, { password_hash: passwordHash });
    return { id: existing.id, user_id: userId, created: false };
  }

  const id = uuidv4();
  await userAuthModel.create({
    id,
    user_id: userId,
    password_hash: passwordHash,
  });
  return { id, user_id: userId, created: true };
};