import express from 'express';
import * as tableController from '../../../controller/trade_business/customers/tableController.js';
import { protect, restrictTo } from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Restrict all table operations to admin users only
router.use(restrictTo('admin', 'system-admin', 'developer'));

// Route for creating all customer tables
router.post('/create-all', tableController.createAllTables, endController);

// Routes for creating individual tables
router.post(
  '/create/customer-name-types',
  tableController.createCustomerNameTypesTable,
  endController,
);
router.post(
  '/create/customer-types-master',
  tableController.createCustomerTypesMasterTable,
  endController,
);
router.post(
  '/create/customer-image-types',
  tableController.createCustomerImageTypesTable,
  endController,
);
router.post(
  '/create/customers',
  tableController.createCustomersTable,
  endController,
);
router.post(
  '/create/customer-names',
  tableController.createCustomerNamesTable,
  endController,
);
router.post(
  '/create/customer-types',
  tableController.createCustomerTypesTable,
  endController,
);
router.post(
  '/create/addresses',
  tableController.createCustomerAddressesTable,
  endController,
);
router.post(
  '/create/contacts',
  tableController.createCustomerContactsTable,
  endController,
);
router.post(
  '/create/images',
  tableController.createCustomerImagesTable,
  endController,
);

// Route for dropping all customer tables
router.delete('/drop-all', tableController.dropAllTables, endController);

// Route for checking if all customer tables exist
router.get('/check-exists', tableController.checkTablesExist, endController);

// Route for getting schema information for all customer tables
router.get('/schema', tableController.getTablesSchema, endController);

export default router;
