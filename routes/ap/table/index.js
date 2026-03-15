import express from 'express';
import * as tableController from '../../../controller/trade_business/ap/tableController.js';
import { protect, restrictTo } from '../../../middleware/authController.js';
import endController from '../../../middleware/endController.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'system-admin', 'developer'));

router.post('/create-all', tableController.createAllTables, endController);
router.delete('/drop-all', tableController.dropAllTables, endController);
router.get('/check-exists', tableController.checkTablesExist, endController);
router.get('/schema', tableController.getTablesSchema, endController);

export default router;
