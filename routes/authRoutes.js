import express from 'express';
import * as authController from '../controller/authController.js';
import { withEndController } from '../utils/routeWrapper.js';
const router = express.Router();

// report
router.route('/getToken').post(withEndController(authController.getToken));

export default router;
