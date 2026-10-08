import express from 'express';
import * as productDetailsController from '../../../../MVC/controller/trade_business/home_page/product_detailsController.js';
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
  .post(productDetailsController.getHomeProductDetails, endController);

// NOTE: `/category` must be declared before `/:id` so the literal path wins.
router
  .route('/category')
  .get(productDetailsController.getHomeProductsByCategory, endController);

router
  .route('/:id')
  .get(productDetailsController.getProductDetail, endController);

export default router;

