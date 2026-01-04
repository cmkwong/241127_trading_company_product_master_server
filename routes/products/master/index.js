import express from 'express';
import * as masterDataController from '../../../controller/trade_business/products/master_dataController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

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
