import express from 'express';
import * as masterDataController from '../../../controller/trade_business/master/master_dataController.js';
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
// ===== Individual Master Data Operations =====
// Get all rows for a specific master table
router.get('/rows', masterDataController.getMasterDataRows, endController);

// Update / create rows for a specific master table
router.post('/rows', masterDataController.updateMasterData, endController);

// Delete rows for a specific master table
router.delete('/rows', masterDataController.deleteMasterData, endController);

router.get(
  '/statistics',
  masterDataController.getMasterDataStatistics,
  endController,
);

router.get(
  '/schema/:tableName?',
  masterDataController.getMasterTableSchema,
  endController,
);

router.get('/:tableName', masterDataController.getMasterData, endController);

// Add new combined operations for truncate and reset
router.post(
  '/truncate/all',
  masterDataController.truncateAllTables,
  endController,
);

router.post(
  '/create/all',
  masterDataController.createAllMasterTables,
  endController,
);

router.post(
  '/create/:tableName',
  masterDataController.createMasterTableByName,
  endController,
);

router.delete(
  '/drop/all',
  masterDataController.dropAllMasterTables,
  endController,
);

router.delete(
  '/drop/:tableName',
  masterDataController.dropMasterTableByName,
  endController,
);

export default router;
