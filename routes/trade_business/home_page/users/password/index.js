import express from 'express';
import * as passwordController from '../../../../../MVC/controller/trade_business/home_page/users/userPasswordController.js';
import * as authController from '../../../../../middleware/authController.js';
import endController from '../../../../../middleware/endController.js';

const router = express.Router();

// All password operations require an authenticated user.
router.use(authController.protect);

// Self-service password update (verifies current password when provided).
router.post('/update', passwordController.updateUserPassword, endController);

// Verify a password against the stored hash.
router.post('/verify', passwordController.verifyUserPassword, endController);

// Admin-only: reset / set a password for an explicit target user.
router.post(
  '/reset',
  authController.restrictTo('admin', 'system-admin'),
  passwordController.resetUserPassword,
  endController,
);

router.post(
  '/set',
  authController.restrictTo('admin', 'system-admin'),
  passwordController.setUserPassword,
  endController,
);

export default router;
