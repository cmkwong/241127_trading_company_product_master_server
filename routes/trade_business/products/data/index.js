import express from 'express';
// import customizationRouter from './customization/index.js';
import * as productsController from '../../../../controller/trade_business/products/data_productsController.js';
import * as authController from '../../../../middleware/authController.js';
import endController from '../../../../middleware/endController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authController.protect);

// Routes that don't require ID validation
router
  .route('/')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    productsController.createProduct,
    endController,
  );

router.post(
  '/list',
  authController.restrictTo('admin', 'manager', 'product-manager'),
  productsController.getAllProducts,
);

router.post(
  '/images/download',
  authController.restrictTo('admin', 'manager', 'product-manager'),
  productsController.downloadProductImages,
);

// Truncate all product tables - ADMIN ONLY
router.post(
  '/truncate',
  authController.restrictTo('admin'), // Restrict to admin only
  productsController.truncateProductTables,
);

// defaults
router
  .route('/defaults')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    productsController.importDefaultProducts,
    endController,
  );

router
  .route('/comparison-keys')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    productsController.getProductComparisonKeys,
    endController,
  );

// Routes that require ID validation
router.route('/get/ids').post(productsController.getProductById, endController);

router
  .route('/ids')
  .patch(productsController.updateProduct, endController)
  .delete(productsController.deleteProduct, endController);

// Check if product exists by ID
router.get('/exists/:id', productsController.checkProductExists, endController);

// router.use('/customization', customizationRouter);

export default router;
