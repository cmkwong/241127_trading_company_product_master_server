import catchAsync from '../../../../../utils/catchAsync.js';
import AppError from '../../../../../utils/appError.js';
import { getProductDetails } from '../../../../models/trade_business/home_page/products/product_details.js';

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
