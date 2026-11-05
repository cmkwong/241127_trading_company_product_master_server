import express from 'express';
import * as catalogsController from '../../../../../MVC/controller/trade_business/panel/catalogs/data_catalogsController.js';
import * as authController from '../../../../../middleware/authController.js';
import endController from '../../../../../middleware/endController.js';

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    catalogsController.getAllCatalogs,
  )
  .post(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    catalogsController.createCatalog,
    endController,
  );

router.post(
  '/list',
  authController.restrictTo('admin', 'manager', 'product-manager'),
  catalogsController.getAllCatalogs,
);

router.post(
  '/truncate',
  authController.restrictTo('admin'),
  catalogsController.truncateCatalogTables,
);

router
  .route('/comparison-keys')
  .get(
    authController.restrictTo('admin', 'manager', 'product-manager'),
    catalogsController.getCatalogComparisonKeys,
    endController,
  );

router
  .route('/get/ids')
  .post(catalogsController.getCatalogById, endController);

router
  .route('/ids')
  .post(catalogsController.getCatalogById, endController)
  .patch(catalogsController.updateCatalog, endController)
  .delete(catalogsController.deleteCatalog, endController);

export default router;
