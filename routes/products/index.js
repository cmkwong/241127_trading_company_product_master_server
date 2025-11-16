import express from 'express';
import * as productController from '../../controller/trade_business/products/productController.js';
import * as authController from '../../controller/authController.js';
import endController from '../../controller/endController.js';
import schemaRoutes from './labels/index.js';

const router = express.Router();

// Mount schema routes
router.use('/labels', schemaRoutes);

// Product data routes
router
  .route('/schema/create')
  .get(
    authController.protect,
    productController.createProductTables,
    endController
  );

// Add more product routes as needed
// router
//   .route('/:id')
//   .get(authController.protect, productController.getProduct, endController)
//   .patch(authController.protect, productController.updateProduct, endController)
//   .delete(authController.protect, productController.deleteProduct, endController);

export default router;
