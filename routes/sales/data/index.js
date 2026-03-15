import express from 'express';
import * as salesController from '../../../controller/trade_business/sales/data_sales_quotationsController.js';
import * as authController from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    salesController.getAllSalesQuotations,
  )
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    salesController.createSalesQuotation,
    endController,
  );

router
  .route('/defaults')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    salesController.importDefaultSalesQuotations,
    endController,
  );

router
  .route('/samples')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    salesController.importDefaultSalesQuotations,
    endController,
  );

router.post(
  '/truncate',
  authController.restrictTo('admin'),
  salesController.truncateSalesTables,
);

router
  .route('/get/ids')
  .post(salesController.getSalesQuotationById, endController);

router
  .route('/ids')
  .patch(salesController.updateSalesQuotation, endController)
  .delete(salesController.deleteSalesQuotation, endController);

export default router;
