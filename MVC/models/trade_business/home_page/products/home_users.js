import { tradeBusinessDbc } from '../../../dbModel.js';

/**
 * home_users.js
 *
 * Resolves the home-page identity for a user (currently the auth `users.username`)
 * into a set of product ids, plus any user-profile helpers the home page needs.
 *
 * TODO(user-profile): there is no `user_profile` table yet. Once one exists
 * (or the mapping is derivable from other tables), implement the per-user
 * lookup here and keep the function signatures stable so controllers do not
 * change. For now every user (and guests) receives the latest products.
 */

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

/**
 * Derive the product ids to show on the home page for a user.
 *
 * @param {string|null} email - The auth email, or null for a guest.
 * @param {Object} [options] - Pagination options.
 * @param {number} [options.offset=0] - Number of products to skip.
 * @param {number} [options.limit=DEFAULT_LIMIT] - Maximum products to return.
 * @returns {Promise<{ids: string[], total: number}>} Product ids (in display
 *   order) plus the total number of products available.
 */
export const getHomeProductIdsForUser = async (
  email,
  { offset = 0, limit = DEFAULT_LIMIT } = {},
) => {
  const safeLimit = Math.min(
    Math.max(Number(limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const safeOffset = Math.max(Number(offset) || 0, 0);

  // TODO(user-profile): once a user -> product mapping exists, branch on
  // email here, e.g.:
  //   SELECT product_id FROM user_home_products WHERE user_id = ?
  // For now, both guests and authenticated users see the most recent products.
  const [rows, countRows] = await Promise.all([
    tradeBusinessDbc.executeQuery(
      `SELECT id FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?;`,
      [safeLimit, safeOffset],
    ),
    tradeBusinessDbc.executeQuery(`SELECT COUNT(*) AS total FROM products;`),
  ]);

  return {
    ids: (rows || []).map((row) => row.id),
    total: Number(countRows?.[0]?.total) || 0,
  };
};

/**
 * Fetch the profile for a given email.
 * TODO(user-profile): implement once a profile source is available.
 * @param {string|null} email
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async (email) => {
  return null;
};
