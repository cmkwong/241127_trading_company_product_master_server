import express from 'express';
import * as authController from '../controller/authController.js';
const router = express.Router();

// web-supervisor
router
  .route('/getWsToken')
  .get(authController.protect, authController.fetchWsvToken);

export default router;
