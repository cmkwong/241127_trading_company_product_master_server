import express from 'express';
import * as tableController from '../../../controller/trade_business/products/tableController.js';
import { protect, restrictTo } from '../../../controller/authController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
// Restrict all table operations to admin users only
router.use(restrictTo('admin', 'system-admin', 'developer'));

// Route for creating all product tables
router.post('/create-all', tableController.createAllTables);

// Routes for creating individual tables
router.post('/create/products', tableController.createProductsTable);
router.post('/create/name-types', tableController.createProductNameTypesTable);
router.post('/create/names', tableController.createProductNamesTable);
router.post('/create/categories', tableController.createCategoriesTable);
router.post(
  '/create/product-categories',
  tableController.createProductCategoriesTable
);
router.post(
  '/create/customizations',
  tableController.createCustomizationsTable
);
router.post(
  '/create/customization-images',
  tableController.createCustomizationImagesTable
);
router.post('/create/links', tableController.createProductLinksTable);
router.post(
  '/create/link-images',
  tableController.createProductLinkImagesTable
);
router.post('/create/alibaba-ids', tableController.createAlibabaIdsTable);
router.post('/create/packing-types', tableController.createPackingTypesTable);
router.post('/create/packings', tableController.createProductPackingsTable);
router.post(
  '/create/certificate-types',
  tableController.createCertificateTypesTable
);
router.post(
  '/create/certificates',
  tableController.createProductCertificatesTable
);
router.post(
  '/create/certificate-files',
  tableController.createProductCertificateFilesTable
);

// Route for dropping all product tables
router.delete('/drop-all', tableController.dropAllTables);

// Route for checking if all product tables exist
router.get('/check-exists', tableController.checkTablesExist);

// Route for getting schema information for all product tables
router.get('/schema', tableController.getTablesSchema);

// Route for initializing master data (optional)
router.post('/init-master-data', tableController.initializeMasterData);

export default router;
