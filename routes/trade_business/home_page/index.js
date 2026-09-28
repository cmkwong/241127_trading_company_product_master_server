import express from 'express';
import { optionalAuth } from '../../../middleware/authController.js';
import * as productDetailsController from '../../../MVC/controller/trade_business/home_page/product_detailsController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

// Resolve the current user (if any) from the request token. Anonymous visitors
// are allowed and treated as guests.
router.use(optionalAuth);

// Home page product details:
//   POST /            -> { product_ids?, offset?, limit? } -> paginated product
//                        cards for the current user (see `pagination.*` in the response)
//   GET  /:id         -> single product detail
router
  .route('/')
  .post(productDetailsController.getHomeProductDetails, endController);

router.route('/:id').get(productDetailsController.getProductDetail, endController);

export default router;
