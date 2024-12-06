import express from 'express';
import * as erpController from '../controller/erpController.js';
import * as authController from '../controller/authController.js';
const router = express.Router();

// report
router
  .route('/updateList')
  .get(authController.protect, erpController.updateERPUsageTable);

router
  .route('/uploadBPMaster')
  .post(authController.protect, erpController.uploadBPMaster);

export default router;
