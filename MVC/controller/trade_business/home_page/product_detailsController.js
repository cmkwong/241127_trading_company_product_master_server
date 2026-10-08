import catchAsync from '../../../../utils/catchAsync.js';
import AppError from '../../../../utils/appError.js';
import {
  getProductDetails,
  getProductDetailsByIds,
  getProductIdsByCategory,
} from '../../../models/trade_business/home_page/products/product_details.js';
import { getHomeProductIdsForUser } from '../../../models/trade_business/home_page/products/home_users.js';

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

/**
 * Get the product details for the home page.
 *
 * Identity is resolved server-side from the JWT (see `optionalAuth`), never
 * trusted from the client. Accepts an optional `product_ids` array to fetch
 * specific products directly (which bypasses pagination), otherwise derives a
 * page of ids for the current user (guests receive the latest products) using
 * `offset` / `limit`.
 *
 * @route POST /api/v1/trade_business/home
 */
export const getHomeProductDetails = catchAsync(async (req, res, next) => {
  const source = { ...(req.query || {}), ...(req.body || {}) };
  const { product_ids, offset, limit } = source;

  const explicitIds = product_ids
    ? Array.isArray(product_ids)
      ? product_ids
      : [product_ids]
    : [];

  // Explicit product ids are returned as-is and are never paginated.
  if (explicitIds.length > 0) {
    const productDetails = await getProductDetailsByIds(explicitIds);
    res.prints = {
      productDetails,
      user: req.user?.name ?? null,
      pagination: {
        offset: 0,
        limit: productDetails.length,
        total: productDetails.length,
        hasMore: false,
      },
    };
    return next();
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const safeOffset = Math.max(Number(offset) || 0, 0);

  const { ids, total } = await getHomeProductIdsForUser(
    req.user?.name ?? null,
    {
      offset: safeOffset,
      limit: safeLimit,
    },
  );

  const productDetails = ids.length ? await getProductDetailsByIds(ids) : [];

  res.prints = {
    productDetails,
    user: req.user?.name ?? null,
    pagination: {
      offset: safeOffset,
      limit: safeLimit,
      total,
      hasMore: safeOffset + ids.length < total,
    },
  };
  next();
});

/**
 * Get the home-page product details for one or more categories.
 *
 * Categories are passed as repeated `category` query parameters (an Express
 * array) and matched exactly against `product_categories.category_id`. At
 * least one is required; the results are paginated with `offset` / `limit`
 * just like the main POST route, so the front-end can reuse the same
 * card-mapping and infinite-scroll flow.
 *
 * @route GET /api/v1/trade_business/home/products/category?category=<id>
 */
export const getHomeProductsByCategory = catchAsync(async (req, res, next) => {
  const raw = req.query?.category;

  const categoryIds = (Array.isArray(raw) ? raw : raw != null ? [raw] : [])
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  if (categoryIds.length === 0) {
    return next(new AppError('category is required.', 400));
  }

  const safeLimit = Math.min(
    Math.max(Number(req.query?.limit) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const safeOffset = Math.max(Number(req.query?.offset) || 0, 0);

  const { ids, total } = await getProductIdsByCategory(categoryIds, {
    offset: safeOffset,
    limit: safeLimit,
  });

  const productDetails = ids.length ? await getProductDetailsByIds(ids) : [];

  res.prints = {
    productDetails,
    user: req.user?.name ?? null,
    pagination: {
      offset: safeOffset,
      limit: safeLimit,
      total,
      hasMore: safeOffset + ids.length < total,
    },
  };
  next();
});

/**
 * Get the product details for a single product id.
 *
 * @route GET /api/v1/trade_business/home_page/:id
 */
export const getProductDetail = catchAsync(async (req, res, next) => {
  const product = await getProductDetails(req.params.id);

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  res.prints = { productDetails: product };
  next();
});
