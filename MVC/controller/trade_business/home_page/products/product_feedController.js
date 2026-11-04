import catchAsync from '../../../../../utils/catchAsync.js';
import {
  resolvePageParams,
  buildPagination,
} from '../../../../../utils/pagination.js';
import { getHomeProductIdsForUser } from '../../../../models/trade_business/home_page/products/home_users.js';
import { getHomeProductCards } from '../../../../models/trade_business/home_page/products/product_card.js';

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
  const { product_ids } = source;

  const explicitIds = product_ids
    ? Array.isArray(product_ids)
      ? product_ids
      : [product_ids]
    : [];

  // Explicit product ids are returned as-is and are never paginated.
  if (explicitIds.length > 0) {
    const productDetails = await getHomeProductCards(explicitIds);
    res.prints = {
      productDetails,
      user: req.user?.name ?? null,
      pagination: buildPagination({
        offset: 0,
        limit: productDetails.length,
        total: productDetails.length,
        returned: productDetails.length,
      }),
    };
    return next();
  }

  const { offset: safeOffset, limit: safeLimit } = resolvePageParams(source);

  const { ids, total } = await getHomeProductIdsForUser(
    req.user?.name ?? null,
    {
      offset: safeOffset,
      limit: safeLimit,
    },
  );

  const productDetails = ids.length ? await getHomeProductCards(ids) : [];

  res.prints = {
    productDetails,
    user: req.user?.name ?? null,
    pagination: buildPagination({
      offset: safeOffset,
      limit: safeLimit,
      total,
      returned: ids.length,
    }),
  };
  next();
});
