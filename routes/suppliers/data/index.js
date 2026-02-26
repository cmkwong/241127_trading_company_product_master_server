import express from 'express';
import * as supplierController from '../../../controller/trade_business/suppliers/data_suppliersController.js';
import * as authController from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authController.protect);

// Routes that don't require ID payload validation
router
  .route('/')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    supplierController.getAllSuppliers,
  )
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    supplierController.createSupplier,
    endController,
  );

// defaults / samples
router
  .route('/defaults')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    supplierController.importDefaultSuppliers,
    endController,
  );

router
  .route('/samples')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    supplierController.importDefaultSuppliers,
    endController,
  );

// Truncate all supplier data - ADMIN ONLY
router.post(
  '/truncate',
  authController.restrictTo('admin'),
  supplierController.truncateSupplierTables,
);

// Routes that require ID payload
router
  .route('/get/ids')
  .post(supplierController.getSupplierById, endController);

router
  .route('/ids')
  .patch(supplierController.updateSupplier, endController)
  .delete(supplierController.deleteSupplier, endController);

export default router;
