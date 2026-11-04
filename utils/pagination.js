/**
 * pagination.js
 *
 * Shared pagination helpers for list-style controllers. Keeps the offset /
 * limit clamping rules and the standard `pagination` metadata block in one
 * place so every endpoint returns the same shape.
 */

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

export const DEFAULT_COLLECTION_SIZE = 10;
export const MAX_COLLECTION_SIZE = 50;

/**
 * Resolve clamped `offset` / `limit` for a paginated list endpoint.
 *
 * @param {Object} [source] - A query-like object (e.g. `req.query` or a merged
 *   query/body source).
 * @returns {{offset: number, limit: number}}
 */
export const resolvePageParams = (source = {}) => {
  const limit = Math.min(
    Math.max(Number(source?.limit) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const offset = Math.max(Number(source?.offset) || 0, 0);
  return { offset, limit };
};

/**
 * Clamp a "collection" size (recommendations / new arrivals, etc.).
 *
 * @param {*} value
 * @returns {number}
 */
export const clampCollectionSize = (value) =>
  Math.min(
    Math.max(Number(value) || DEFAULT_COLLECTION_SIZE, 1),
    MAX_COLLECTION_SIZE,
  );

/**
 * Build the standard pagination metadata block.
 *
 * @param {Object} [options]
 * @param {number} [options.offset]
 * @param {number} [options.limit]
 * @param {number} [options.total]
 * @param {number} [options.returned] - Number of items actually returned.
 * @returns {{offset: number, limit: number, total: number, hasMore: boolean}}
 */
export const buildPagination = ({
  offset = 0,
  limit = 0,
  total = 0,
  returned = 0,
} = {}) => ({
  offset,
  limit,
  total,
  hasMore: offset + returned < total,
});
