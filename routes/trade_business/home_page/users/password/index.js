import express from 'express';
import * as passwordController from '../../../../../MVC/controller/trade_business/home_page/users/userPasswordController.js';
import * as authController from '../../../../../middleware/authController.js';
import endController from '../../../../../middleware/endController.js';
import { createRateLimiter } from '../../../../../middleware/rateLimit.js';
import { securityConfig } from '../../../../../utils/securityConfig.js';

const router = express.Router();

const { rateLimits } = securityConfig;

// Public "forgot password" flow (no authentication): request a reset link and
// redeem it with a new password. Rate-limited server-side (per IP and per
// email) to stop email bombing and token harvesting.
router.post(
  '/forgot',
  createRateLimiter({
    windowMs: rateLimits.windowMs,
    max: rateLimits.forgotPerIp,
    message: 'Too many reset requests. Please try again later.',
  }),
  createRateLimiter({
    windowMs: rateLimits.windowMs,
    max: rateLimits.forgotPerEmail,
    message: 'Too many reset requests. Please try again later.',
    keyGenerator: (req) =>
      String(req.body?.email ?? '').trim().toLowerCase(),
  }),
  passwordController.requestPasswordReset,
);
router.post(
  '/forgot/confirm',
  createRateLimiter({
    windowMs: rateLimits.windowMs,
    max: rateLimits.confirmPerIp,
    message: 'Too many attempts. Please try again later.',
  }),
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
