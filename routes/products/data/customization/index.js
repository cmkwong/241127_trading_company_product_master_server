import express from 'express';
import * as authController from '../../../../middleware/authController.js';
import endController from '../../../../middleware/endController.js';
import * as customizationController from '../../../../controller/trade_business/products/customizationController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authController.protect);

router
  .get('/id/:id', customizationController.getCustomizations)
  .get('/productId/:productId', customizationController.getCustomizations);

router.post('/', customizationController.createCustomization);
export default router;
