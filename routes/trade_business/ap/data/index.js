import express from 'express';
import * as apController from '../../../../controller/trade_business/ap/data_ap_invoicesController.js';
import * as authController from '../../../../middleware/authController.js';
import endController from '../../../../middleware/endController.js';

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    apController.getAllApInvoices,
  )
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    apController.createApInvoice,
    endController,
  );

router
  .route('/defaults')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    apController.importDefaultApInvoices,
    endController,
  );

router
  .route('/samples')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    apController.importDefaultApInvoices,
    endController,
  );

router.post(
  '/truncate',
  authController.restrictTo('admin'),
  apController.truncateApTables,
);

router.route('/get/ids').post(apController.getApInvoiceById, endController);

router
  .route('/ids')
  .patch(apController.updateApInvoice, endController)
  .delete(apController.deleteApInvoice, endController);

export default router;
