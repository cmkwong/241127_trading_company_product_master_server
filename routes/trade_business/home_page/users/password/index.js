import express from 'express';
import * as passwordController from '../../../../../MVC/controller/trade_business/home_page/users/userPasswordController.js';
import * as authController from '../../../../../middleware/authController.js';
import endController from '../../../../../middleware/endController.js';

const router = express.Router();

// Public "forgot password" flow (no authentication): request a reset link and
// redeem it with a new password.
router.post('/forgot', passwordController.requestPasswordReset);
router.post(
  '/forgot/confirm',
  passwordController.resetPasswordWithToken,
);

// Self-service password update (verifies current password when provided).
router.post(
  '/update',
  authController.protect,
  passwordController.updateUserPassword,
  endController,
);

// Verify a password against the stored hash.
router.post(
  '/verify',
  authController.protect,
  passwordController.verifyUserPassword,
  endController,
);

// Admin-only: reset / set a password for an explicit target user.
router.post(
  '/reset',
  authController.protect,
  authController.restrictTo('admin', 'system-admin'),
  passwordController.resetUserPassword,
  endController,
);

router.post(
  '/set',
  authController.protect,
  authController.restrictTo('admin', 'system-admin'),
  passwordController.setUserPassword,
  endController,
);

export default router;
