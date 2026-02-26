import express from 'express';
import * as customerController from '../../../controller/trade_business/customers/data_customersController.js';
import * as authController from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    customerController.getAllCustomers,
  )
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    customerController.createCustomer,
    endController,
  );

router
  .route('/defaults')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    customerController.importDefaultCustomers,
    endController,
  );

router
  .route('/samples')
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    customerController.importDefaultCustomers,
    endController,
  );

router.post(
  '/truncate',
  authController.restrictTo('admin'),
  customerController.truncateCustomerTables,
);

router
  .route('/ids')
  .post(customerController.getCustomerById, endController)
  .patch(customerController.updateCustomer, endController)
  .delete(customerController.deleteCustomer, endController);

export default router;
