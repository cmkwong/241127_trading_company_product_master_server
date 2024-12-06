import express from 'express';
import * as authController from '../controller/authController.js';
import * as sysController from '../controller/sysController.js';

const router = express.Router();

router
  .route('/movingFiles')
  .post(authController.protect, sysController.moveFiles);
router
  .route('/testingEmail')
  .post(authController.protect, sysController.sendEmail);

export default router;
