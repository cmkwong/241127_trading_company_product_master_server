import express from 'express';
import * as userController from '../../../../../MVC/controller/trade_business/home_page/users/data_usersController.js';

const router = express.Router();

// Public self-service registration — no protect / restrictTo middleware.
router.post('/', userController.signupUser);

// Send the passwordless email-verification (magic) link. The account is only
// created once the link is redeemed via `getTokenWithMagicLink`.
router.post('/send-magic-link', userController.sendSignupMagicLink);

// Pre-flight duplicate-email check (public) so the sign-up form can warn the
// user before creating an account or sending a verification email.
router.get('/check-email', userController.checkEmailAvailability);

export default router;
