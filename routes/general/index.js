import express from 'express';
import * as tradeBusinessController from '../../controller/general/trade_business_controller.js';
import { protect, restrictTo } from '../../middleware/authController.js';
import endController from '../../middleware/endController.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'system-admin', 'developer'));

router.post(
  '/trade-business/create/all',
  tradeBusinessController.createAllTradeBusinessTables,
  endController,
);

router.post(
  '/trade-business/defaults/all',
  tradeBusinessController.insertAllTradeBusinessDefaults,
  endController,
);

router.delete(
  '/trade-business/drop/all',
  tradeBusinessController.dropAllTradeBusinessTables,
  endController,
);

export default router;
