import catchAsync from '../../../../../utils/catchAsync.js';
import AppError from '../../../../../utils/appError.js';
import {
  resolvePageParams,
  buildPagination,
} from '../../../../../utils/pagination.js';
import { getProductIdsByCategory } from '../../../../models/trade_business/home_page/products/product_details.js';
import { getHomeProductCards } from '../../../../models/trade_business/home_page/products/product_card.js';

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

  const { offset: safeOffset, limit: safeLimit } = resolvePageParams(req.query);

  const { ids, total } = await getProductIdsByCategory(categoryIds, {
    offset: safeOffset,
    limit: safeLimit,
  });

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
