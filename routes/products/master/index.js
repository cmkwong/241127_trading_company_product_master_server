import express from 'express';
import * as masterDataController from '../../../controller/trade_business/products/master_dataController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

/**
 * Create standard CRUD routes for a master data entity type
 * @param {string} basePath - Base path for the routes (e.g., '/packing-types')
 * @param {Object} controller - Controller object with CRUD methods
 */
const createMasterDataRoutes = (basePath, controller) => {
  // Base routes for collection (GET all, POST new)
  router
    .route(basePath)
    .get(controller.getAll, endController)
    .post(controller.create, endController);

  // Routes for specific items by ID
  router
    .route(`${basePath}/:id`)
    .get(controller.getById, endController)
    .patch(controller.update, endController)
    .delete(controller.delete, endController);

  // Related products route
  router.get(
    `${basePath}/:id/products`,
    controller.getRelatedProducts,
    endController
  );

  // Batch creation route
  router.post(`${basePath}/batch`, controller.batchCreate, endController);

  // Insert defaults route
  router.post(`${basePath}/defaults`, controller.insertDefaults, endController);

  // Add truncate route if the controller supports it
  if (controller.truncate) {
    router.post(`${basePath}/truncate`, controller.truncate, endController);
  }

  // Add reset route if the controller supports it
  if (controller.reset) {
    router.post(`${basePath}/reset`, controller.reset, endController);
  }

  return router;
};

// Create standard routes for all master data types
createMasterDataRoutes('/packing-types', masterDataController.packingTypes);
createMasterDataRoutes(
  '/product-name-types',
  masterDataController.productNameTypes
);

// Only add certificate types routes if the controller exists
if (masterDataController.certificateTypes) {
  createMasterDataRoutes(
    '/certificate-types',
    masterDataController.certificateTypes
  );
}

// Only add categories routes if the controller exists
if (masterDataController.categories) {
  createMasterDataRoutes('/categories', masterDataController.categories);

  // Add category-specific routes
  if (masterDataController.categories.getChildCategories) {
    router.get(
      '/categories/:id/children',
      masterDataController.categories.getChildCategories,
      endController
    );
  }

  if (masterDataController.categories.getCategoryPath) {
    router.get(
      '/categories/:id/path',
      masterDataController.categories.getCategoryPath,
      endController
    );
  }

  if (masterDataController.categories.getCategoryTree) {
    router.get(
      '/category-tree',
      masterDataController.categories.getCategoryTree,
      endController
    );
  }
}

// Add packing types statistics route if it exists
if (masterDataController.packingTypes.getStatistics) {
  router.get(
    '/packing-types/:id/statistics',
    masterDataController.packingTypes.getStatistics,
    endController
  );
}

// ===== Combined Master Data Operations =====
router.post(
  '/defaults/all',
  masterDataController.insertAllDefaults,
  endController
);

router.get(
  '/statistics',
  masterDataController.getMasterDataStatistics,
  endController
);

router.get(
  '/check-exists',
  masterDataController.checkEntityExists,
  endController
);

// Add new combined operations for truncate and reset
router.post(
  '/truncate/all',
  masterDataController.truncateAllTables,
  endController
);

router.post(
  '/reset/all',
  masterDataController.resetAllMasterData,
  endController
);

export default router;
