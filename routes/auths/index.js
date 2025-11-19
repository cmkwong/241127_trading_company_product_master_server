import express from 'express';
import * as authController from '../../middleware/authController.js';
import endController from '../../middleware/endController.js';

const router = express.Router();

// Authentication routes
router.route('/getToken').post(authController.getToken, endController);

// Add other auth routes as needed
// router.route('/login').post(authController.login, endController);
// router.route('/logout').get(authController.logout, endController);

export default router;
