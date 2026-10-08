import express from 'express';
import * as authController from '../../../../middleware/authController.js';
import endController from '../../../../middleware/endController.js';

const router = express.Router();

// Authentication routes
router.route('/getToken').post(authController.getToken, endController);
router
  .route('/getTokenWithEmail')
  .post(authController.getTokenWithEmail, endController);

// Passwordless "magic link" (server-generated JWT) auth — kept alongside the
// Firebase flow above so the latter remains available as a fallback.
router
  .route('/sendLoginMagicLink')
  .post(authController.sendLoginMagicLink, endController);
router
  .route('/getTokenWithMagicLink')
  .post(authController.getTokenWithMagicLink, endController);

// Add other auth routes as needed
// router.route('/login').post(authController.login, endController);
// router.route('/logout').get(authController.logout, endController);

export default router;
