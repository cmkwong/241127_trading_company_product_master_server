import express from 'express';
import * as tableController from '../../../controller/trade_business/suppliers/tableController.js';
import { protect, restrictTo } from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Restrict all table operations to admin users only
router.use(restrictTo('admin', 'system-admin', 'developer'));

// Route for creating all supplier tables
router.post('/create-all', tableController.createAllTables, endController);

// Routes for creating individual tables
router.post(
  '/create/supplier-types',
  tableController.createSupplierTypesTable,
  endController,
);
router.post(
  '/create/suppliers',
  tableController.createSuppliersTable,
  endController,
);
router.post(
  '/create/address-types',
  tableController.createAddressTypesTable,
  endController,
);
router.post(
  '/create/addresses',
  tableController.createSupplierAddressesTable,
  endController,
);
router.post(
  '/create/contact-types',
  tableController.createContactTypesTable,
  endController,
);
router.post(
  '/create/contacts',
  tableController.createSupplierContactsTable,
  endController,
);
router.post(
  '/create/link-types',
  tableController.createSupplierLinkTypesTable,
  endController,
);
router.post(
  '/create/links',
  tableController.createSupplierLinksTable,
  endController,
);
router.post(
  '/create/service-types',
  tableController.createServiceTypesTable,
  endController,
);
router.post(
  '/create/services',
  tableController.createSupplierServicesTable,
  endController,
);
router.post(
  '/create/service-images',
  tableController.createSupplierServiceImagesTable,
  endController,
);

// Route for dropping all supplier tables
router.delete('/drop-all', tableController.dropAllTables, endController);

// Route for checking if all supplier tables exist
router.get('/check-exists', tableController.checkTablesExist, endController);

// Route for getting schema information for all supplier tables
router.get('/schema', tableController.getTablesSchema, endController);

export default router;
