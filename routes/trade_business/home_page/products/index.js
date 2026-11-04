import express from 'express';
import * as productFeedController from '../../../../MVC/controller/trade_business/home_page/products/product_feedController.js';
import * as productCategoryController from '../../../../MVC/controller/trade_business/home_page/products/product_categoryController.js';
import * as productRecommendationsController from '../../../../MVC/controller/trade_business/home_page/products/product_recommendationsController.js';
import * as productDetailController from '../../../../MVC/controller/trade_business/home_page/products/product_detailController.js';
import endController from '../../../../middleware/endController.js';

const router = express.Router();

// Home page product details:
//   POST /            -> { product_ids?, offset?, limit? } -> paginated product
//                        cards for the current user (see `pagination.*` in the response)
//   GET  /category    -> ?category=<id>&category=<id> -> paginated product cards
//                        filtered to the given categories
//   GET  /:id         -> single product detail
router
  .route('/')
  .post(productFeedController.getHomeProductDetails, endController);

// NOTE: `/category`, `/recommendations` and `/new-arrivals` must be declared
// before `/:id` so the literal paths win over the id catch-all.
router
  .route('/category')
  .get(productCategoryController.getHomeProductsByCategory, endController);

router
  .route('/recommendations')
  .get(productRecommendationsController.getRecommendedProducts, endController);

router
  .route('/new-arrivals')
  .get(productRecommendationsController.getNewArrivalProducts, endController);

router
  .route('/:id')
  .get(productDetailController.getProductDetail, endController);

export default router;

