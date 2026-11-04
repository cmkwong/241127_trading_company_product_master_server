import catchAsync from '../../../../../utils/catchAsync.js';
import {
  clampCollectionSize,
  buildPagination,
} from '../../../../../utils/pagination.js';
import {
  getRecommendedProductIds,
  getNewArrivalProductIds,
} from '../../../../models/trade_business/home_page/products/home_recommendations.js';
import { getHomeProductCards } from '../../../../models/trade_business/home_page/products/product_card.js';

/**
 * Get the recommended products for the current visitor (max 10 by default; the
 * front-end decides how many to display).
 *
 * The logged-in user's id is resolved server-side from the JWT (`optionalAuth`)
 * and passed to the recommendation model so it can analyse the user's
 * interests. Guests (no verified token) follow the guest recommendation logic.
 *
 * @route GET /api/v1/trade_business/home/products/recommendations
 */
export const getRecommendedProducts = catchAsync(async (req, res, next) => {
  const limit = clampCollectionSize(req.query?.limit);

  const ids = await getRecommendedProductIds({
    userIdentifier: req.user?.name ?? null,
    limit,
  });

  const productDetails = await getHomeProductCards(ids);

  res.prints = {
    productDetails,
    user: req.user?.name ?? null,
    isGuest: !req.user,
    pagination: buildPagination({
      offset: 0,
      limit,
      total: productDetails.length,
      returned: productDetails.length,
    }),
  };
  next();
});

/**
 * Get the "New Arrivals" products (created within the last 2 months, randomly
 * selected; max 10 by default, the front-end decides how many to show).
 *
 * @route GET /api/v1/trade_business/home/products/new-arrivals
 */
export const getNewArrivalProducts = catchAsync(async (req, res, next) => {
  const limit = clampCollectionSize(req.query?.limit);

  const ids = await getNewArrivalProductIds({ limit });

  const productDetails = await getHomeProductCards(ids);

  res.prints = {
    productDetails,
    user: req.user?.name ?? null,
    isGuest: !req.user,
    pagination: buildPagination({
      offset: 0,
      limit,
      total: productDetails.length,
      returned: productDetails.length,
    }),
  };
  next();
});
