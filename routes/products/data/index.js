import express from 'express';
import customizationRouter from './customization/index.js';
import * as productsController from '../../../controller/trade_business/products/data_productsController.js';
import * as authController from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authController.protect);

// Routes that don't require ID validation
router
  .route('/')
  .get(productsController.getProducts)
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    productsController.createProduct,
    endController
  );

// Truncate all product tables - ADMIN ONLY
router.post(
  '/truncate',
  authController.restrictTo('admin'), // Restrict to admin only
  productsController.truncateProductTables
);

// defaults
router
  .route('/defaults')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    productsController.importDefaultProducts,
    endController
  );

// Product statistics
router.get(
  '/stats',
  authController.restrictTo('admin', 'manager', 'product-manager', 'analyst'),
  productsController.getProductStats,
  endController
);

// Check if product exists by code
router.get(
  '/exists-by-code/:code',
  productsController.validateProductCode,
  productsController.checkProductExistsByCode,
  endController
);

// Get product by code
router.get(
  '/code/:code',
  productsController.validateProductCode,
  productsController.getProductByCode,
  endController
);

// Routes that require ID validation
router
  .route('/:id')
  .get(
    productsController.validateProductId,
    productsController.getProductById,
    endController
  )
  .patch(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    productsController.validateProductId,
    productsController.updateProduct,
    endController
  )
  .delete(
    authController.restrictTo('admin', 'manager'),
    productsController.validateProductId,
    productsController.deleteProduct,
    endController
  );

// Check if product exists by ID
router.get(
  '/exists/:id',
  productsController.validateProductId,
  productsController.checkProductExists,
  endController
);

router.use('/customization', customizationRouter);

export default router;
