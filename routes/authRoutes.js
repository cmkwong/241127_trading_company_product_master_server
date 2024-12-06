import express from 'express';
import * as authController from '../controller/authController.js';
const router = express.Router();

// report
router.route('/getToken').post(authController.getToken);

router.route('/getErpToken').post(authController.fetchErpToken);

export default router;
