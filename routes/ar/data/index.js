import express from 'express';
import * as arController from '../../../controller/trade_business/ar/data_ar_invoicesController.js';
import * as authController from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    arController.getAllArInvoices,
  )
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    arController.createArInvoice,
    endController,
  );

router
  .route('/defaults')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    arController.importDefaultArInvoices,
    endController,
  );

router
  .route('/samples')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    arController.importDefaultArInvoices,
    endController,
  );

router.post(
  '/truncate',
  authController.restrictTo('admin'),
  arController.truncateArTables,
);

router.route('/get/ids').post(arController.getArInvoiceById, endController);

router
  .route('/ids')
  .patch(arController.updateArInvoice, endController)
  .delete(arController.deleteArInvoice, endController);

export default router;
