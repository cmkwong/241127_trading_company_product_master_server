import express from 'express';
import * as tableController from '../../../controller/trade_business/products/tableController.js';
import { protect, restrictTo } from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Restrict all table operations to admin users only
router.use(restrictTo('admin', 'system-admin', 'developer'));

// Route for creating all product tables
router.post('/create-all', tableController.createAllTables, endController);

// Routes for creating individual tables
router.post(
  '/create/products',
  tableController.createProductsTable,
  endController
);
router.post(
  '/create/name-types',
  tableController.createProductNameTypesTable,
  endController
);
router.post(
  '/create/names',
  tableController.createProductNamesTable,
  endController
);
router.post(
  '/create/categories',
  tableController.createCategoriesTable,
  endController
);
router.post(
  '/create/product-categories',
  tableController.createProductCategoriesTable,
  endController
);
router.post(
  '/create/customizations',
  tableController.createCustomizationsTable,
  endController
);
router.post(
  '/create/customization-images',
  tableController.createCustomizationImagesTable,
  endController
);
router.post(
  '/create/links',
  tableController.createProductLinksTable,
  endController
);
router.post(
  '/create/link-images',
  tableController.createProductLinkImagesTable,
  endController
);
router.post(
  '/create/alibaba-ids',
  tableController.createAlibabaIdsTable,
  endController
);
router.post(
  '/create/packing-types',
  tableController.createPackingTypesTable,
  endController
);
router.post(
  '/create/packings',
  tableController.createProductPackingsTable,
  endController
);
router.post(
  '/create/certificate-types',
  tableController.createCertificateTypesTable,
  endController
);
router.post(
  '/create/certificates',
  tableController.createProductCertificatesTable,
  endController
);
router.post(
  '/create/certificate-files',
  tableController.createProductCertificateFilesTable,
  endController
);

// Route for dropping all product tables
router.delete('/drop-all', tableController.dropAllTables, endController);

// Route for checking if all product tables exist
router.get('/check-exists', tableController.checkTablesExist, endController);

// Route for getting schema information for all product tables
router.get('/schema', tableController.getTablesSchema, endController);

export default router;
