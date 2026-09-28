import { tradeBusinessDbc } from '../../dbModel.js';

/**
 * product_details.js
 *
 * Functions that turn a product id (or a list of product ids) into the
 * "product card" details shown on the home page:
 *
 *   - main icon image   (products.icon_url)
 *   - min order qty     (products.min_order_qty)
 *   - price             (see formatProductPrice below)
 *   - product name      (product_names.name)
 *   - origin            (product_attribute_values -> master_product_attributes
 *                        where the attribute label/name is "Origin")
 *
 * The price output is implemented in a separate function (formatProductPrice)
 * as required, and supports the three selling modes defined by
 * `products.selling_by_mode`:
 *   - 'by_qty'          -> product_sale_prices_by_qty (lowest MOQ tier)
 *   - 'by_variants'     -> product_costs.sales_price (min - max range)
 *   - 'by_single_price' -> products.sale_single_price_min / max
 */

// The master_product_attributes label used to locate a product's origin.
const ORIGIN_ATTRIBUTE_LABEL = 'Origin';

// Currency display prefixes are resolved from `master_currencies.detailed_symbol`
// (e.g. "US$", "CA$") at query time. See `resolveCurrencyPrefix` below.

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const roundPrice = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const resolveCurrencyPrefix = (currency) => {
  if (!currency) return '';
  if (currency.detailed_symbol) return currency.detailed_symbol;
  if (currency.symbol) return currency.symbol;
  return String(currency.code || '').toUpperCase();
};

const formatPriceValue = (value, currency) => {
  const number = toFiniteNumber(value);
  if (number === null) return '';
  return `${resolveCurrencyPrefix(currency)}${roundPrice(number).toFixed(2)}`;
};

const buildPlaceholders = (count) => Array(count).fill('?').join(', ');

// ---------------------------------------------------------------------------
// (a) Main icon image
// ---------------------------------------------------------------------------

/**
 * Return the main icon image for a product row.
 * @param {Object} productRow - A row from the `products` table.
 * @returns {string|null} The icon URL, or null when absent.
 */
export const getMainIconImage = (productRow) => {
  if (!productRow) return null;
  return productRow.icon_url || productRow.icon_name || null;
};

// ---------------------------------------------------------------------------
// (c) Separated price output function
// ---------------------------------------------------------------------------

const buildPriceResult = (method, min, max, moq, currency) => {
  let display = '';
  if (min !== null && max !== null) {
    display =
      min === max
        ? formatPriceValue(min, currency)
        : `${formatPriceValue(min, currency)} - ${formatPriceValue(max, currency)}`;
  } else if (min !== null) {
    display = formatPriceValue(min, currency);
  } else if (max !== null) {
    display = formatPriceValue(max, currency);
  }

  const moqValue = moq === null ? undefined : moq;

  return {
    method,
    currency: currency?.code || currency?.symbol || null,
    min,
    max,
    moq: moqValue,
    moqLabel: moqValue === undefined ? '' : `MOQ: ${moqValue}`,
    display,
  };
};

/**
 * Build the normalized price output for a product.
 *
 * @param {Object}   args
 * @param {string}   args.sellingByMode - 'by_qty' | 'by_variants' | 'by_single_price'
 * @param {number}   args.minOrderQty   - products.min_order_qty
 * @param {Object[]} args.qtyTiers      - product_sale_prices_by_qty rows
 * @param {number[]} args.variantPrices - product_costs.sales_price values
 * @param {Object}   args.singlePrice   - { min, max } from products sale_single_price_*
 * @param {Object}   args.currency      - { code, symbol } master_currencies row
 * @returns {{method: string, currency: string|null, min: number|null, max: number|null,
 *            moq: number|undefined, moqLabel: string, display: string}}
 */
export const formatProductPrice = ({
  sellingByMode = 'by_qty',
  minOrderQty,
  qtyTiers = [],
  variantPrices = [],
  singlePrice = {},
  currency = null,
}) => {
  const moq = toFiniteNumber(minOrderQty);

  // (b.i) Price by quantity: show the price of the lowest-MOQ tier.
  if (sellingByMode === 'by_qty') {
    const tiers = (qtyTiers || [])
      .map((tier) => ({
        minOrderQty: toFiniteNumber(tier?.min_order_qty),
        salePrice: toFiniteNumber(tier?.sale_price),
      }))
      .filter((tier) => tier.minOrderQty !== null)
      .sort((a, b) => a.minOrderQty - b.minOrderQty);

    const lowest = tiers[0];
    if (!lowest) {
      // No tiers configured yet: fall back to any single price available.
      const fallback =
        toFiniteNumber(singlePrice?.min) ?? toFiniteNumber(singlePrice?.max);
      return buildPriceResult('by_qty', fallback, fallback, moq, currency);
    }

    return buildPriceResult(
      'by_qty',
      lowest.salePrice,
      lowest.salePrice,
      moq,
      currency,
    );
  }

  // (b.ii) Price by variants: show the min - max range.
  if (sellingByMode === 'by_variants') {
    const prices = (variantPrices || [])
      .map((value) => toFiniteNumber(value))
      .filter((value) => value !== null);

    const min = prices.length > 0 ? Math.min(...prices) : null;
    const max = prices.length > 0 ? Math.max(...prices) : null;

    return buildPriceResult('by_variants', min, max, moq, currency);
  }

  // 'by_single_price' (and any unknown mode) falls through to the range.
  const min = toFiniteNumber(singlePrice?.min);
  const max = toFiniteNumber(singlePrice?.max);
  return buildPriceResult('by_single_price', min, max, moq, currency);
};

// ---------------------------------------------------------------------------
// (a) Product details composition
// ---------------------------------------------------------------------------

const pickProductName = (nameRows) => {
  if (!nameRows || nameRows.length === 0) return null;
  const sorted = [...nameRows].sort((a, b) => {
    const aOrder = toFiniteNumber(a?.display_order) ?? 0;
    const bOrder = toFiniteNumber(b?.display_order) ?? 0;
    return aOrder - bOrder;
  });
  return sorted[0]?.name || null;
};

const resolveCurrency = ({
  sellingByMode,
  qtyRows,
  costRows,
  product,
  currencyById,
}) => {
  if (sellingByMode === 'by_qty') {
    const tiers = [...qtyRows].sort((a, b) => {
      const aQty = toFiniteNumber(a?.min_order_qty) ?? Infinity;
      const bQty = toFiniteNumber(b?.min_order_qty) ?? Infinity;
      return aQty - bQty;
    });
    return currencyById.get(tiers[0]?.currency_id) || null;
  }

  if (sellingByMode === 'by_variants') {
    return currencyById.get(costRows[0]?.sales_currency_id) || null;
  }

  return currencyById.get(product?.sale_single_price_currency_id) || null;
};

const buildProductDetail = (
  product,
  { nameRows, qtyRows, costRows, originValues, currencyById, categoryIds },
) => {
  const sellingByMode = product?.selling_by_mode || 'by_qty';
  const currency = resolveCurrency({
    sellingByMode,
    qtyRows,
    costRows,
    product,
    currencyById,
  });

  const price = formatProductPrice({
    sellingByMode,
    minOrderQty: product?.min_order_qty,
    qtyTiers: qtyRows,
    variantPrices: (costRows || []).map((row) => row.sales_price),
    singlePrice: {
      min: product?.sale_single_price_min,
      max: product?.sale_single_price_max,
    },
    currency,
  });

  return {
    id: product.id,
    name: pickProductName(nameRows),
    mainIconImage: getMainIconImage(product),
    origin: originValues[0] ?? null,
    minOrderQty: toFiniteNumber(product?.min_order_qty),
    categoryIds: categoryIds || [],
    price,
  };
};

/**
 * Load product details for a list of product ids using batched queries
 * (no N+1). Supports the home-page flow (server gets ids -> returns cards).
 *
 * @param {string[]} productIds
 * @returns {Promise<Object[]>} Card-ready product details, in input order.
 */
export const getProductDetailsByIds = async (productIds) => {
  const ids = [
    ...new Set(
      (productIds || []).map((id) => String(id).trim()).filter(Boolean),
    ),
  ];

  if (ids.length === 0) return [];

  const placeholders = buildPlaceholders(ids.length);

  const [
    productRows,
    nameRows,
    qtyRows,
    costRows,
    originRows,
    currencyRows,
    categoryRows,
  ] = await Promise.all([
      tradeBusinessDbc.executeQuery(
        `SELECT id, icon_url, icon_name, min_order_qty, selling_by_mode,
              sale_single_price_currency_id, sale_single_price_min,
              sale_single_price_max
         FROM products
        WHERE id IN (${placeholders});`,
        ids,
      ),
      tradeBusinessDbc.executeQuery(
        `SELECT product_id, name, display_order
         FROM product_names
        WHERE product_id IN (${placeholders});`,
        ids,
      ),
      tradeBusinessDbc.executeQuery(
        `SELECT product_id, min_order_qty, currency_id, sale_price
         FROM product_sale_prices_by_qty
        WHERE product_id IN (${placeholders});`,
        ids,
      ),
      tradeBusinessDbc.executeQuery(
        `SELECT product_id, sales_currency_id, sales_price
         FROM product_costs
        WHERE product_id IN (${placeholders})
          AND sales_price IS NOT NULL;`,
        ids,
      ),
      tradeBusinessDbc.executeQuery(
        `SELECT pav.product_id, pav.value
         FROM product_attribute_values pav
         JOIN master_product_attributes mpa ON mpa.id = pav.attribute_id
        WHERE pav.product_id IN (${placeholders})
          AND (LOWER(mpa.label) = LOWER('${ORIGIN_ATTRIBUTE_LABEL}')
               OR LOWER(mpa.name) = LOWER('${ORIGIN_ATTRIBUTE_LABEL}'));`,
        ids,
      ),
      tradeBusinessDbc.executeQuery(
        `SELECT id, code, symbol, detailed_symbol FROM master_currencies;`,
      ),
      tradeBusinessDbc.executeQuery(
        `SELECT product_id, category_id
         FROM product_categories
        WHERE product_id IN (${placeholders});`,
        ids,
      ),
    ]);

  const namesByProduct = new Map();
  for (const row of nameRows) {
    if (!namesByProduct.has(row.product_id))
      namesByProduct.set(row.product_id, []);
    namesByProduct.get(row.product_id).push(row);
  }

  const qtyByProduct = new Map();
  for (const row of qtyRows) {
    if (!qtyByProduct.has(row.product_id)) qtyByProduct.set(row.product_id, []);
    qtyByProduct.get(row.product_id).push(row);
  }

  const costsByProduct = new Map();
  for (const row of costRows) {
    if (!costsByProduct.has(row.product_id))
      costsByProduct.set(row.product_id, []);
    costsByProduct.get(row.product_id).push(row);
  }

  const originByProduct = new Map();
  for (const row of originRows) {
    if (!originByProduct.has(row.product_id))
      originByProduct.set(row.product_id, []);
    originByProduct.get(row.product_id).push(row.value);
  }

  const categoryIdsByProduct = new Map();
  for (const row of categoryRows) {
    if (!categoryIdsByProduct.has(row.product_id))
      categoryIdsByProduct.set(row.product_id, []);
    categoryIdsByProduct.get(row.product_id).push(row.category_id);
  }

  const currencyById = new Map(
    currencyRows.map((currency) => [currency.id, currency]),
  );
  const productById = new Map(
    productRows.map((product) => [product.id, product]),
  );

  return ids
    .map((id) => {
      const product = productById.get(id);
      if (!product) return null;
      return buildProductDetail(product, {
        nameRows: namesByProduct.get(id) || [],
        qtyRows: qtyByProduct.get(id) || [],
        costRows: costsByProduct.get(id) || [],
        originValues: originByProduct.get(id) || [],
        currencyById,
        categoryIds: categoryIdsByProduct.get(id) || [],
      });
    })
    .filter(Boolean);
};

/**
 * (a) Get product details for a single product id.
 * @param {string} productId
 * @returns {Promise<Object|null>} Product details, or null when not found.
 */
export const getProductDetails = async (productId) => {
  if (!productId) return null;
  const details = await getProductDetailsByIds([productId]);
  return details[0] ?? null;
};
