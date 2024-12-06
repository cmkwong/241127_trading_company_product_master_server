import express from 'express';
import * as viewController from '../controller/viewsController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

router.route('/').get(authController.protect, viewController.viewLogin);
router.route('/ssme').get(viewController.view_ssmeapp);
router
  .route('/creditFacility')
  .get(authController.protect, viewController.viewCreditFacility);

export default router;
