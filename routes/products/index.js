import express from 'express';
import * as productController from '../../controller/trade_business/products/tableController.js';
import * as authController from '../../controller/authController.js';
import endController from '../../controller/endController.js';
import labelsRoutes from './labels/index.js';

const router = express.Router();

// Mount schema routes
router.use('/labels', labelsRoutes);

// Product data routes
router
  .route('/tables')
  .get(
    authController.protect,
    productController.createProductTables,
    endController
  )
  .delete(
    authController.protect,
    productController.dropProductTables,
    endController
  );

// Add more product routes as needed
// router
//   .route('/:id')
//   .get(authController.protect, productController.getProduct, endController)
//   .patch(authController.protect, productController.updateProduct, endController)
//   .delete(authController.protect, productController.deleteProduct, endController);

export default router;
