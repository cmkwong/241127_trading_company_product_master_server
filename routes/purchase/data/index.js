import express from 'express';
import * as purchaseController from '../../../controller/trade_business/purchase/data_purchase_requestsController.js';
import * as authController from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    purchaseController.getAllPurchaseRequests,
  )
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    purchaseController.createPurchaseRequest,
    endController,
  );

router
  .route('/defaults')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    purchaseController.importDefaultPurchaseRequests,
    endController,
  );

router
  .route('/samples')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    purchaseController.importDefaultPurchaseRequests,
    endController,
  );

router.post(
  '/truncate',
  authController.restrictTo('admin'),
  purchaseController.truncatePurchaseTables,
);

router
  .route('/get/ids')
  .post(purchaseController.getPurchaseRequestById, endController);

router
  .route('/ids')
  .patch(purchaseController.updatePurchaseRequest, endController)
  .delete(purchaseController.deletePurchaseRequest, endController);

export default router;
