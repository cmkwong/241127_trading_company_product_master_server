import express from 'express';
import * as productsController from '../../../controller/trade_business/products/data_productsController.js';
import * as authController from '../../../middleware/authController.js';
import routeTracker from '../../../middleware/routeTracker.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authController.protect);

// Apply route tracker to all routes in this router
router.use(routeTracker);

// Routes that don't require ID validation
router
  .route('/')
  .get(productsController.getProducts)
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    productsController.validateProductData,
    productsController.createProduct
  );

// Generate product ID
router.get('/generate-id', productsController.generateProductId);

// Product statistics
router.get(
  '/stats',
  authController.restrictTo('admin', 'manager', 'product-manager', 'analyst'),
  productsController.getProductStats
);

// Check if product exists by code
router.get(
  '/exists-by-code/:code',
  productsController.validateProductCode,
  productsController.checkProductExistsByCode
);

// Get product by code
router.get(
  '/code/:code',
  productsController.validateProductCode,
  productsController.getProductByCode
);

// Routes that require ID validation
router
  .route('/:id')
  .get(productsController.validateProductId, productsController.getProductById)
  .patch(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    productsController.validateProductId,
    productsController.updateProduct
  )
  .delete(
    authController.restrictTo('admin', 'manager'),
    productsController.validateProductId,
    productsController.deleteProduct
  );

// Check if product exists by ID
router.get(
  '/exists/:id',
  productsController.validateProductId,
  productsController.checkProductExists
);

export default router;
