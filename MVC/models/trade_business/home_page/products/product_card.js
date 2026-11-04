import { getProductDetailsByIds } from './product_details.js';

/**
 * product_card.js
 *
 * The single source of truth for the home-page "product object template".
 *
 * Every home-page endpoint returns the same flat, type-safe card shape so the
 * front-end can reuse one mapper regardless of whether the products came from
 * the main feed, a category, a recommendation, or the new-arrivals list.
 *
 * Template fields (see `HOME_PRODUCT_CARD_TEMPLATE`):
 *   - id           products.id
 *   - name         product_names.name (lowest display_order wins)
 *   - image        raw icon path (products.icon_url / icon_name); the client
 *                  prefixes the file-server base URL as needed
 *   - origin       product_attribute_values -> "Origin" attribute
 *   - moq          products.min_order_qty (number|null)
 *   - moqLabel     "MOQ: 50" or "" when absent
 *   - priceFrom    lowest price (number|null)
 *   - priceTo      highest price (number|null)
 *   - priceDisplay formatted "US$1.00 - US$2.00" style string
 *   - currency     resolved currency code (string|null)
 *   - categoryIds  product_categories.category_id values (string[])
 *   - categoryId   first category id (string|null) — FE convenience
 *
 * Prices are resolved by the existing `formatProductPrice` logic inside
 * `product_details.js`; this module only normalises that richer object into the
 * flat template and guarantees missing values are `null` (never `undefined` or
 * empty strings) so consumers can render "—" without extra guards.
 */

const toFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNullableString = (value) =>
  value === undefined || value === null ? null : String(value);

/**
 * The canonical home-page product card template (documentation only — the
 * actual values are produced by `buildHomeProductCard`).
 */
export const HOME_PRODUCT_CARD_TEMPLATE = {
  id: '',
  name: '',
  image: null,
  origin: null,
  moq: null,
  moqLabel: '',
  priceFrom: null,
  priceTo: null,
  priceDisplay: '',
  currency: null,
  categoryIds: [],
  categoryId: null,
};

/**
 * Map a raw product detail (the object returned by `getProductDetailsByIds`)
 * into the flat home-page card template.
 *
 * Accepts the nested shape `{ name, mainIconImage, origin, minOrderQty,
 * categoryIds, price: { currency, min, max, display } }` and also tolerates a
 * pre-flattened object so the mapping stays idempotent.
 *
 * @param {Object} detail
 * @returns {Object} A card matching `HOME_PRODUCT_CARD_TEMPLATE`.
 */
export const buildHomeProductCard = (detail) => {
  if (!detail) return { ...HOME_PRODUCT_CARD_TEMPLATE };

  const price = detail?.price || {};
  const categoryIds = Array.isArray(detail?.categoryIds)
    ? detail.categoryIds
    : [];

  return {
    id: detail?.id ?? null,
    name: detail?.name || 'Untitled product',
    image: toNullableString(detail?.image ?? detail?.mainIconImage),
    origin: toNullableString(detail?.origin),
    moq: toFiniteNumber(detail?.moq ?? detail?.minOrderQty),
    moqLabel:
      toFiniteNumber(detail?.moq ?? detail?.minOrderQty) === null
        ? ''
        : `MOQ: ${toFiniteNumber(detail?.moq ?? detail?.minOrderQty)}`,
    priceFrom: toFiniteNumber(detail?.priceFrom ?? price.min),
    priceTo: toFiniteNumber(detail?.priceTo ?? price.max),
    priceDisplay: detail?.priceDisplay ?? price.display ?? '',
    currency: toNullableString(detail?.currency ?? price.currency),
    categoryIds,
    categoryId: categoryIds[0] ?? null,
  };
};

/**
 * Load the raw product details for a list of ids and normalise them into the
 * home-page card template, preserving the input order and dropping any id that
 * has no matching product.
 *
 * @param {string[]} productIds
 * @returns {Promise<Object[]>} Card-ready products in input order.
 */
export const getHomeProductCards = async (productIds) => {
  const details = await getProductDetailsByIds(productIds);
  return (details || []).map(buildHomeProductCard);
};
