import express from 'express';
import * as masterDataController from '../../../controller/trade_business/products/master_dataController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

// ===== Combined Master Data Operations =====
router.post(
  '/defaults/all',
  masterDataController.insertAllDefaults,
  endController,
);

router.post(
  '/reset/all',
  masterDataController.resetAllMasterData,
  endController,
);

router.post(
  '/reset/:tableName',
  masterDataController.resetMasterDataByTable,
  endController,
);

router.get('/:tableName', masterDataController.getMasterData, endController);

router.get(
  '/statistics',
  masterDataController.getMasterDataStatistics,
  endController,
);

// Add new combined operations for truncate and reset
router.post(
  '/truncate/all',
  masterDataController.truncateAllTables,
  endController,
);

export default router;
