import express from 'express';
import * as machineController from '../controller/machineController.js';
import * as authController from '../controller/authController.js';
const router = express.Router();

// machine master and IN/OUT
router
  .route('/renew')
  .post(authController.protect, machineController.renewMachineData);
router
  .route('/clearItemMaster')
  .get(authController.protect, machineController.clearMachineItemMaster);
router
  .route('/createItemMaster')
  .get(authController.protect, machineController.createMachineItemMaster);
router
  .route('/getDetail')
  .get(authController.protect, machineController.getPlantData);
router
  .route('/inout')
  .get(authController.protect, machineController.getPlantInout);
router
  .route('/runhrs')
  .get(authController.protect, machineController.getRunHrs);

export default router;
