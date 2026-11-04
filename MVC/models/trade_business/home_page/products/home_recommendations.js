import { tradeBusinessDbc } from '../../../dbModel.js';

/**
 * home_recommendations.js
 *
 * Derives product ids for the home-page "Recommendation" and "New Arrivals"
 * sections. Both recommendation strategies are intentionally thin shells right
 * now: the logged-in analysis and the guest logic both fall back to a random
 * selection until a real recommendation engine is built. The function
 * signatures are stable so controllers do not need to change when the logic
 * lands.
 */

const RECOMMENDATION_DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/** Products created within this many months are "New Arrivals". */
const NEW_ARRIVAL_WINDOW_MONTHS = 2;

const safeLimit = (limit) =>
  Math.min(
    Math.max(Number(limit) || RECOMMENDATION_DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

const buildPlaceholders = (count) => Array(count).fill('?').join(', ');

/**
 * Resolve a login identifier (the auth email / username stored in
 * `req.user.name`) into a `users.id`. Returns null for guests.
 *
 * @param {string|null} identifier
 * @returns {Promise<string|null>}
 */
export const resolveUserIdByIdentifier = async (identifier) => {
  if (!identifier) return null;
  const rows = await tradeBusinessDbc.executeQuery(
    'SELECT id FROM users WHERE email = ? LIMIT 1;',
    [String(identifier).trim().toLowerCase()],
  );
  return rows?.[0]?.id ?? null;
};

/**
 * Pick `limit` random product ids, optionally excluding a set of ids.
 *
 * @param {Object} [options]
 * @param {number} [options.limit]
 * @param {string[]} [options.excludeIds]
 * @returns {Promise<string[]>}
 */
export const getRandomProductIds = async ({ limit, excludeIds = [] } = {}) => {
  const safe = safeLimit(limit);
  const excluded = [
    ...new Set((excludeIds || []).map((id) => String(id).trim()).filter(Boolean)),
  ];

  const where = excluded.length
    ? `WHERE id NOT IN (${buildPlaceholders(excluded.length)})`
    : '';
  const rows = await tradeBusinessDbc.executeQuery(
    `SELECT id FROM products ${where} ORDER BY RAND() LIMIT ?;`,
    [...excluded, safe],
  );
  return (rows || []).map((row) => row.id);
};

/**
 * Shell for the logged-in user's personalised recommendations.
 *
 * TODO(recommendation): analyse the user's interest from
 *   `user_product_history` (data_user_product_history.js) and
 *   `user_favourites` (data_user_favourites.js) — both keyed by
 *   (user_id, product_id). For example, find the most-viewed/favourited
 *   categories and return products from those categories, excluding products
 *   the user already interacted with. Until then, fall back to a random
 *   selection.
 *
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<string[]>}
 */
const getPersonalisedIds = async (userId, limit) => {
  void userId; // reserved for the interest-analysis implementation
  return getRandomProductIds({ limit });
};

/**
 * Shell for guest (anonymous) recommendations.
 *
 * TODO(guest-recommendation): derive anonymous interest from session/cookie
 *   browsing history, geo/currency, or trending products. Until then, fall back
 *   to a random selection.
 *
 * @param {number} limit
 * @returns {Promise<string[]>}
 */
const getGuestIds = async (limit) => {
  return getRandomProductIds({ limit });
};

/**
 * Derive the recommended product ids for the current visitor.
 *
 * @param {Object} [options]
 * @param {string|null} [options.userIdentifier] - The auth identifier, or null
 *   for a guest.
 * @param {number} [options.limit]
 * @returns {Promise<string[]>}
 */
export const getRecommendedProductIds = async ({
  userIdentifier = null,
  limit,
} = {}) => {
  const safe = safeLimit(limit);
  const userId = userIdentifier
    ? await resolveUserIdByIdentifier(userIdentifier)
    : null;

  if (userId) {
    return getPersonalisedIds(userId, safe);
  }
  return getGuestIds(safe);
};

/**
 * Derive product ids for the "New Arrivals" section: products created within
 * the recent window, randomly selected. When the recent pool is smaller than
 * `limit`, the list is padded with random older products so the section can
 * still return a full set of cards.
 *
 * @param {Object} [options]
 * @param {number} [options.limit]
 * @param {number} [options.months] - Window length (defaults to
 *   NEW_ARRIVAL_WINDOW_MONTHS).
 * @returns {Promise<string[]>}
 */
export const getNewArrivalProductIds = async ({
  limit,
  months = NEW_ARRIVAL_WINDOW_MONTHS,
} = {}) => {
  const safe = safeLimit(limit);
  // `INTERVAL` cannot always be parameterised, so coerce to a bounded integer
  // before interpolating.
  const safeMonths = Math.min(
    Math.max(Math.trunc(Number(months)) || NEW_ARRIVAL_WINDOW_MONTHS, 1),
    120,
  );

  const newRows = await tradeBusinessDbc.executeQuery(
    `SELECT id
       FROM products
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeMonths} MONTH)
      ORDER BY RAND()
      LIMIT ?;`,
    [safe],
  );
  const ids = (newRows || []).map((row) => row.id);

  if (ids.length >= safe) {
    return ids;
  }

  // Pad with random older products (excluding the ones already picked).
  const padding = await getRandomProductIds({
    limit: safe - ids.length,
    excludeIds: ids,
  });

  return [...ids, ...padding];
};
