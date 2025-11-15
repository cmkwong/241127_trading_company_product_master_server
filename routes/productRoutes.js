import express from 'express';
import * as productController from '../controller/productController.js';
import * as authController from '../controller/authController.js';
const router = express.Router();

// report
router
  .route('/product')
  .post(authController.protect, productController.postProduct);

export default router;
